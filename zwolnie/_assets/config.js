// Supabase config dla panelu zwolnie-etaty
// Anon key jest publiczny (RLS chroni dane).
window.ZE_CONFIG = {
  SUPABASE_URL: 'https://tahusvkrzaijcywuivle.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaHVzdmtyemFpamN5d3VpdmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDUyNTIsImV4cCI6MjA5NDY4MTI1Mn0.bPE5ct_Lt2w8gY_8lL6hZpKyMS7fJWp37qpLPFFLSR0',
  STORAGE_BUCKET: 'ze-attachments',
  CLIENT_VIEW_BASE: '/zwolnie/p/' // URL klienta: /zwolnie/p/{token}
};

window.ZE_SB = window.supabase.createClient(
  window.ZE_CONFIG.SUPABASE_URL,
  window.ZE_CONFIG.SUPABASE_ANON_KEY,
  { auth: { persistSession: true, storageKey: 'ze_session_v1' } }
);
