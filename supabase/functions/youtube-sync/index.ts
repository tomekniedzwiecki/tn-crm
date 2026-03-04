import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user || user.email !== "tomekniedzwiecki@gmail.com") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { channelId } = await req.json();

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "Channel ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get uploads playlist ID from channel
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Channel not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const channelStats = channelData.items[0].statistics;

    // Get all videos from uploads playlist
    let allVideos: any[] = [];
    let nextPageToken = "";

    do {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

      const playlistResponse = await fetch(playlistUrl);
      const playlistData = await playlistResponse.json();

      if (playlistData.items) {
        allVideos = [...allVideos, ...playlistData.items];
      }

      nextPageToken = playlistData.nextPageToken || "";
    } while (nextPageToken);

    // Get detailed stats for each video (in batches of 50)
    const videoIds = allVideos.map((v) => v.contentDetails.videoId);
    const videosWithStats: any[] = [];

    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${batch.join(",")}&key=${YOUTUBE_API_KEY}`;

      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();

      if (statsData.items) {
        for (const videoStats of statsData.items) {
          const originalVideo = allVideos.find(
            (v) => v.contentDetails.videoId === videoStats.id
          );

          if (originalVideo) {
            videosWithStats.push({
              youtube_id: videoStats.id,
              title: originalVideo.snippet.title,
              description: originalVideo.snippet.description,
              published_at: originalVideo.snippet.publishedAt,
              thumbnail_url:
                originalVideo.snippet.thumbnails?.maxres?.url ||
                originalVideo.snippet.thumbnails?.high?.url ||
                originalVideo.snippet.thumbnails?.medium?.url,
              duration_seconds: parseDuration(videoStats.contentDetails.duration),
              views: parseInt(videoStats.statistics.viewCount) || 0,
              likes: parseInt(videoStats.statistics.likeCount) || 0,
              comments: parseInt(videoStats.statistics.commentCount) || 0,
              stats_updated_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    // Upsert videos to database
    for (const video of videosWithStats) {
      await supabase.from("content_youtube_videos").upsert(video, {
        onConflict: "youtube_id",
      });

      // Also save to stats history
      await supabase.from("content_youtube_stats_history").insert({
        youtube_video_id: (
          await supabase
            .from("content_youtube_videos")
            .select("id")
            .eq("youtube_id", video.youtube_id)
            .single()
        ).data?.id,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        videosCount: videosWithStats.length,
        channelStats: {
          subscribers: channelStats.subscriberCount,
          totalViews: channelStats.viewCount,
          videoCount: channelStats.videoCount,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("YouTube sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}
