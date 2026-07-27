// ============================================
// supabase.ts — Multi-Tenant Portfolio Service (FIXED)
// Each invited user manages their own portfolio
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ─── TYPES ───

export interface Portfolio {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  owner_id: string;
  is_published: boolean;
  is_active: boolean;
  custom_domain: string | null;
  created_at: string;
}

export interface PortfolioMember {
  id: string;
  portfolio_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_by: string | null;
  invited_at: string;
}

export interface PortfolioMemberWithUser extends PortfolioMember {
  user_email?: string;
  user_name?: string;
}

export interface Invitation {
  id: string;
  email: string;
  portfolio_id: string;
  token: string;
  invited_by: string;
  expires_at: string;
  is_accepted: boolean;
  accepted_at: string | null;
  created_at: string;
  // Populated when joining with portfolios table
  portfolios?: { title: string; slug: string };
}

export interface Theme {
  id: string;
  portfolio_id: string;
  name: string;
  slug?: string;
  is_active: boolean;
  is_featured?: boolean;
  order_index?: number;

  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_accent_soft: string;
  color_accent_bg: string;
  color_dark: string;
  color_light: string;
  color_gray: string;
  color_gray_warm: string;
  color_text: string;
  color_text_muted: string;
  color_success: string;
  color_warning: string;
  color_danger: string;
  color_featured: string;

  font_family: string;
  border_radius: number;
  max_width: number;
  gradient_direction: string;

  card_style: string;
  button_style: string;
  enable_animations: boolean;
  dark_mode: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface Hero {
  id: string;
  portfolio_id: string;
  is_active: boolean;
  greeting: string;
  name: string;
  subtitle: string;
  background_image: string | null;
  buttons: { text: string; link: string; variant?: string }[];
  updated_at?: string;
}

export interface About {
  id: string;
  portfolio_id: string;
  is_active: boolean;
  heading: string;
  bio: string;
  image_url: string | null;
  stats: { label: string; value: string }[];
  updated_at?: string;
}

export interface Skill {
  id: string;
  portfolio_id: string;
  is_active: boolean;
  name: string;
  level: string; // "Beginner" | "Intermediate" | "Advanced" | "Expert"
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  portfolio_id: string;
  is_active: boolean;
  featured: boolean;           // was is_featured
  title: string;
  slug: string;
  category: string;
  description: string;
  long_description: string;
  technologies: string[];        // was tech_stack
  tags?: string[];              // legacy fallback only
  images: string[];             // was gallery
  image_url: string | null;     // was thumbnail_url
  live_url: string | null;
  github_url: string | null;    // was repo_url
  insta_url: string | null;
  fb_url: string | null;
  behance_url: string | null;
  linkedin_url: string | null;
  reddit_url: string | null;
  status: 'in_progress' | 'completed' | 'archived' | 'planned';
  display_order: number;
  updated_at?: string;
}

export interface Contact {
  id: string;
  portfolio_id: string;
  is_active: boolean;

  heading: string;
  description: string;
  email: string;
  phone: string;
  location: string;

  whatsapp_number: string;
  whatsapp_message: string;
  linkedin_url: string;
  github_url: string;
  twitter_url: string;
  instagram_url: string;
  facebook_url: string;
  reddit_url: string;
  youtube_url: string;
  dribbble_url: string;
  behance_url: string;

  form_enabled: boolean;
  form_success_message: string;

  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  id: string;
  portfolio_id: string;
  site_title: string;
  site_description: string;
  favicon_url: string;
  og_image_url: string;
  nav_order: string[];
}

export interface ContactSubmission {
  id: string;
  portfolio_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PortfolioData {
  portfolio: Portfolio | null;
  theme: Theme | null;
  hero: Hero | null;
  about: About | null;
  skills: Skill[];
  projects: Project[];
  contact: Contact | null;
  settings: SiteSettings | null;
}

// ─── AUTH ───

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── PROFILES (replaces direct auth.users queries) ───

export async function getProfiles(userIds: string[]) {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', userIds);

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return data || [];
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

// FIX D: Check if user is allowed to create portfolios (flag + limit)
export async function canCreatePortfolio(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const profile = await getProfile(user.id);
  if (!profile) return false;

  // Must have explicit permission
  if (profile.can_create_portfolios !== true) return false;

  // Must not exceed max portfolio limit
  const count = await getUserPortfolioCount(user.id);
  const maxAllowed = profile.max_portfolios ?? 0;
  return count < maxAllowed;
}

// NEW: Count how many portfolios this user owns
export async function getUserPortfolioCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('portfolios')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId);

  if (error) {
    console.error('Error counting portfolios:', error);
    return Infinity; // Fail closed — assume limit reached
  }
  return count || 0;
}

// NEW: Get user's portfolio limit info (for dashboard display)
export async function getUserPortfolioLimitInfo(): Promise<{
  canCreate: boolean;
  currentCount: number;
  maxAllowed: number;
} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  if (!profile) return null;

  const count = await getUserPortfolioCount(user.id);
  const maxAllowed = profile.max_portfolios ?? 0;

  return {
    canCreate: profile.can_create_portfolios === true && count < maxAllowed,
    currentCount: count,
    maxAllowed,
  };
}

// ─── ADMIN: USER MANAGEMENT ───

// NEW: Fetch all profiles (for admin user management)
export async function getAllProfiles(): Promise<any[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, can_create_portfolios, max_portfolios, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
  return data || [];
}

// NEW: Admin updates a user's permissions
export async function updateUserPermissions(
  userId: string,
  updates: { can_create_portfolios?: boolean; max_portfolios?: number }
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user permissions:', error);
    return false;
  }
  return true;
}

// ─── PORTFOLIOS ───

// FIX C: Fetch portfolios the user OWNS or is a MEMBER of
export async function getMyPortfolios(): Promise<Portfolio[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  // 1. Fetch portfolios I own
  const { data: owned, error: ownedError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (ownedError) {
    console.error('Error fetching owned portfolios:', ownedError);
  }

  // 2. Fetch portfolio IDs where I am a member
  const { data: memberRows, error: memberError } = await supabase
    .from('portfolio_members')
    .select('portfolio_id')
    .eq('user_id', user.id);

  if (memberError) {
    console.error('Error fetching member rows:', memberError);
    return owned || [];
  }

  let memberPortfolios: Portfolio[] = [];
  if (memberRows && memberRows.length > 0) {
    const portfolioIds = memberRows.map(m => m.portfolio_id);
    const { data: mp, error: mpError } = await supabase
      .from('portfolios')
      .select('*')
      .in('id', portfolioIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (mpError) {
      console.error('Error fetching member portfolios:', mpError);
    } else {
      memberPortfolios = mp || [];
    }
  }

  // 3. Merge and deduplicate (in case owner is also a member)
  const all = [...(owned || []), ...memberPortfolios];
  const unique = Array.from(new Map(all.map(p => [p.id, p])).values());
  return unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getPortfolioBySlug(slug: string): Promise<Portfolio | null> {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching portfolio:', error);
    return null;
  }
  return data;
}

// FIX D: Only allow portfolio creation if user has permission
export async function createPortfolio(title: string, slug: string, description?: string): Promise<Portfolio | null> {
  const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (!cleanSlug) {
    console.error('Invalid slug');
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    console.error('No authenticated user');
    return null;
  }

  // FIX D: Check permission + limit
  const profile = await getProfile(user.id);
  if (!profile || profile.can_create_portfolios !== true) {
    console.error('User does not have permission to create portfolios');
    return null;
  }

  const count = await getUserPortfolioCount(user.id);
  const maxAllowed = profile.max_portfolios ?? 0;
  if (count >= maxAllowed) {
    console.error(`Portfolio limit reached: ${count}/${maxAllowed}`);
    return null;
  }

  // FIX: Include owner_id in the insert
  const { data, error } = await supabase
    .from('portfolios')
    .insert({ title, slug: cleanSlug, description, owner_id: user.id })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating portfolio:', error);
    return null;
  }

  // Trigger automatically creates:
  // - site_settings, contact, hero, about, default theme
  // - portfolio_members (owner row)
  // No need to insert portfolio_members here.

  return data;
}

export async function updatePortfolio(id: string, updates: Partial<Portfolio>): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // FIX: Verify ownership before updating
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!portfolio || portfolio.owner_id !== user.id) {
    console.error('Unauthorized: only owner can update portfolio');
    return false;
  }

  const { error } = await supabase
    .from('portfolios')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating portfolio:', error);
    return false;
  }
  return true;
}

export async function deletePortfolio(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // FIX: Verify ownership before deleting
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!portfolio || portfolio.owner_id !== user.id) {
    console.error('Unauthorized: only owner can delete portfolio');
    return false;
  }

  const { error } = await supabase
    .from('portfolios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting portfolio:', error);
    return false;
  }
  return true;
}

// ─── INVITATIONS ───

// FIX B: Send email via Edge Function after creating invitation
export async function inviteUser(email: string, portfolioId: string): Promise<Invitation | null> {
  const user = await getCurrentUser();
  if (!user) {
    console.error('No authenticated user');
    return null;
  }

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      email,
      portfolio_id: portfolioId,
      invited_by: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invitation:', JSON.stringify(error, null, 2));
    return null;
  }

  // FIX B: Send invitation email via Edge Function
  if (data) {
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          token: data.token,
          portfolioId,
          invitedBy: user.id,
        },
      });

      if (emailError) {
        // FunctionsHttpError hides the response body — extract it from error.context
        let errorBody: any = {};
        try {
          // error.context is the raw Response object
          errorBody = await (emailError as any).context?.json?.() || {};
        } catch {
          errorBody = { error: emailError.message };
        }
        console.error('Edge function error body:', errorBody);
        console.error('Edge function status:', (emailError as any).context?.status);
        // Log but don't fail the invitation — the DB row was already created
        console.warn('Invitation created but email failed to send. Reason:', errorBody.error || emailError.message);
      } else {
        console.log('Invitation email sent:', emailData);
      }
    } catch (emailErr: any) {
      // Network-level or unexpected error
      console.error('Failed to send invitation email:', emailErr?.message || emailErr);
    }
  }

  return data;
}

// NEW: Fetch a single invitation by token (for validation)
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  console.log('🔍 getInvitationByToken called with token:', token?.slice(0, 16) + '...');

  // FIX: Use .maybeSingle() instead of .single()
  // .single() throws PGRST116 when 0 rows match (e.g., RLS blocks it)
  // .maybeSingle() returns null gracefully
  const { data, error } = await supabase
    .from('invitations')
    .select('*, portfolios(title, slug)')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    console.error('❌ Error fetching invitation by token:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    return null;
  }

  if (!data) {
    console.warn('⚠️ No invitation found for this token (RLS may be blocking it)');
    return null;
  }

  console.log('✅ Invitation found:', {
    id: data.id,
    email: data.email,
    is_accepted: data.is_accepted,
    expires_at: data.expires_at,
  });

  return data;
}

export async function getMyInvitations(): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, portfolios(title, slug)')
    .eq('is_accepted', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }
  return data || [];
}

// NEW: Fetch invitations with inviter profile info (uses profiles table, not auth.users)
export async function getInvitationsWithInviter(): Promise<(Invitation & { inviter_email?: string; inviter_name?: string })[]> {
  const invitations = await getMyInvitations();
  if (invitations.length === 0) return invitations;

  const inviterIds = [...new Set(invitations.map(i => i.invited_by).filter(Boolean))] as string[];
  const profiles = await getProfiles(inviterIds);
  const profileMap = new Map(profiles.map(p => [p.id, p]));

  return invitations.map(inv => ({
    ...inv,
    inviter_email: profileMap.get(inv.invited_by)?.email,
    inviter_name: profileMap.get(inv.invited_by)?.full_name,
  }));
}

export async function getPortfolioInvitations(portfolioId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolio invitations:', error);
    return [];
  }
  return data || [];
}

export async function acceptInvitation(token: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('accept_invitation', { invite_token: token });

  if (error) {
    console.error('Error accepting invitation:', error);
    return false;
  }
  return data || false;
}

// ─── PORTFOLIO MEMBERS (FIXED — uses profiles table, not auth.users) ───

export async function getPortfolioMembers(portfolioId: string): Promise<PortfolioMember[]> {
  const { data: members, error } = await supabase
    .from('portfolio_members')
    .select('*')
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }
  return members || [];
}

// FIXED: Fetches emails from public.profiles instead of auth.users
export async function getPortfolioMembersWithEmails(portfolioId: string): Promise<PortfolioMemberWithUser[]> {
  const { data: members, error: membersError } = await supabase
    .from('portfolio_members')
    .select('*')
    .eq('portfolio_id', portfolioId);

  if (membersError || !members) {
    console.error('Error fetching members:', membersError);
    return [];
  }

  if (members.length === 0) return [];

  const userIds = [...new Set(members.map(m => m.user_id).filter(Boolean))] as string[];
  const profiles = await getProfiles(userIds);
  const profileMap = new Map(profiles.map(p => [p.id, p]));

  return members.map(m => ({
    ...m,
    user_email: profileMap.get(m.user_id)?.email,
    user_name: profileMap.get(m.user_id)?.full_name,
  }));
}

// FIX A: Fetch members AND accepted invitations merged together
export async function getPortfolioMembersWithInvitations(portfolioId: string): Promise<(PortfolioMemberWithUser & { accepted_from_invite?: boolean; invite_email?: string; invite_accepted_at?: string | null })[]> {
  const members = await getPortfolioMembersWithEmails(portfolioId);
  const invitations = await getPortfolioInvitations(portfolioId);
  const acceptedInvites = invitations.filter(i => i.is_accepted);

  // Enrich members with accepted invitation metadata by matching email

  // For members that came from invitations, try to match by invited_by + timing
  // Since we can't perfectly match, we at least enrich with invite info if available
  return members.map(m => {
    const matchingInvite = acceptedInvites.find(inv =>
      inv.email.toLowerCase() === m.user_email?.toLowerCase()
    );
    return {
      ...m,
      accepted_from_invite: !!matchingInvite,
      invite_email: matchingInvite?.email,
      invite_accepted_at: matchingInvite?.accepted_at,
    };
  });
}

export async function removeMember(portfolioId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('portfolio_members')
    .delete()
    .eq('portfolio_id', portfolioId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing member:', error);
    return false;
  }
  return true;
}

// ─── THEMES ───

export async function getActiveTheme(portfolioId: string): Promise<Theme | null> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching active theme:', error);
    return null;
  }
  return data;
}

export async function getAllThemes(portfolioId: string): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching themes:', error);
    return [];
  }
  return data || [];
}

// FIX: Deactivate other themes before setting one active
export async function setActiveTheme(portfolioId: string, themeId: string): Promise<boolean> {
  // First, deactivate all themes for this portfolio
  const { error: deactivateError } = await supabase
    .from('themes')
    .update({ is_active: false })
    .eq('portfolio_id', portfolioId);

  if (deactivateError) {
    console.error('Error deactivating themes:', deactivateError);
    return false;
  }

  // Then activate the selected one
  const { error } = await supabase
    .from('themes')
    .update({ is_active: true })
    .eq('id', themeId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error setting active theme:', error);
    return false;
  }
  return true;
}

export async function createTheme(portfolioId: string, theme: Partial<Theme>): Promise<Theme | null> {
  const themeData = {
    ...theme,
    portfolio_id: portfolioId,
    slug: theme.slug || theme.name?.toLowerCase().replace(/\s+/g, '-') || 'custom-theme'
  };
  const { data, error } = await supabase
    .from('themes')
    .insert(themeData)
    .select()
    .single();

  if (error) {
    console.error('Error creating theme:', error);
    return null;
  }
  return data;
}

export async function updateTheme(portfolioId: string, themeId: string, updates: Partial<Theme>): Promise<boolean> {
  const { error } = await supabase
    .from('themes')
    .update(updates)
    .eq('id', themeId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error updating theme:', error);
    return false;
  }
  return true;
}

export async function deleteTheme(portfolioId: string, themeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', themeId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error deleting theme:', error);
    return false;
  }
  return true;
}

// ─── HERO ───

export async function getHero(portfolioId: string): Promise<Hero | null> {
  const { data, error } = await supabase
    .from('hero')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching hero:', error);
    return null;
  }
  return data;
}

export async function updateHero(portfolioId: string, heroId: string, updates: Partial<Hero>): Promise<boolean> {
  const { error } = await supabase
    .from('hero')
    .update(updates)
    .eq('id', heroId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error updating hero:', error);
    return false;
  }
  return true;
}

// ─── ABOUT ───

export async function getAbout(portfolioId: string): Promise<About | null> {
  const { data, error } = await supabase
    .from('about')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching about:', error);
    return null;
  }
  return data;
}

export async function updateAbout(portfolioId: string, aboutId: string, updates: Partial<About>): Promise<boolean> {
  const { error } = await supabase
    .from('about')
    .update(updates)
    .eq('id', aboutId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error updating about:', error);
    return false;
  }
  return true;
}

// ─── SKILLS ───

export async function getSkills(portfolioId: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
  return data || [];
}

export async function createSkill(portfolioId: string, skill: Partial<Skill>): Promise<Skill | null> {
  const { data, error } = await supabase
    .from('skills')
    .insert({ ...skill, portfolio_id: portfolioId })
    .select()
    .single();

  if (error) {
    console.error('Error creating skill:', error);
    return null;
  }
  return data;
}

export async function updateSkill(portfolioId: string, skillId: string, updates: Partial<Skill>): Promise<boolean> {
  const { error } = await supabase
    .from('skills')
    .update(updates)
    .eq('id', skillId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error updating skill:', error);
    return false;
  }
  return true;
}

export async function deleteSkill(portfolioId: string, skillId: string): Promise<boolean> {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', skillId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error deleting skill:', error);
    return false;
  }
  return true;
}

// ─── PROJECTS ───

export async function getProjects(portfolioId: string, options?: { featuredOnly?: boolean; limit?: number }): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('display_order', { ascending: true });

  // FIX: Use correct column name `featured` instead of `is_featured`
  if (options?.featuredOnly) query = query.eq('featured', true);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data || [];
}

export async function getProjectBySlug(portfolioId: string, slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching project by slug:', error);
    return null;
  }
  return data;
}

export async function createProject(portfolioId: string, project: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...project, portfolio_id: portfolioId })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return null;
  }
  return data;
}

export async function updateProject(portfolioId: string, projectId: string, updates: Partial<Project>): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error updating project:', error);
    return false;
  }
  return true;
}

export async function deleteProject(portfolioId: string, projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }
  return true;
}

// ─── CONTACT ───

export async function getContact(portfolioId: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contact')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching contact:', error);
    return null;
  }
  return data;
}

export async function updateContact(portfolioId: string, contactId: string, updates: Partial<Contact>): Promise<boolean> {
  const { error } = await supabase
    .from('contact')
    .update(updates)
    .eq('id', contactId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error updating contact:', error);
    return false;
  }
  return true;
}

export function getWhatsAppLink(number: string, message?: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  const msg = encodeURIComponent(message || '');
  return `https://wa.me/${cleanNumber}${msg ? `?text=${msg}` : ''}`;
}

export async function submitContactForm(
  portfolioId: string,
  name: string,
  email: string,
  message: string,
  subject?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('contact_submissions')
    .insert({ portfolio_id: portfolioId, name, email, message, subject: subject || null });

  if (error) {
    console.error('Error submitting contact form:', error);
    return false;
  }
  return true;
}

// ─── SITE SETTINGS ───

export async function getSiteSettings(portfolioId: string): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .single();

  if (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
  return data;
}

export async function updateSiteSettings(portfolioId: string, settingsId: string, updates: Partial<SiteSettings>): Promise<boolean> {
  const { error } = await supabase
    .from('site_settings')
    .update(updates)
    .eq('id', settingsId)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error updating site settings:', error);
    return false;
  }
  return true;
}

// ─── CONTACT SUBMISSIONS ───

export async function getContactSubmissions(portfolioId: string): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  return data || [];
}

export async function markSubmissionAsRead(portfolioId: string, id: string): Promise<boolean> {
  const { error } = await supabase
    .from('contact_submissions')
    .update({ is_read: true })
    .eq('id', id)
    .eq('portfolio_id', portfolioId);

  if (error) {
    console.error('Error marking submission as read:', error);
    return false;
  }
  return true;
}

// ─── BULK FETCH (for App.tsx initial load) ───

export async function fetchAllPortfolioData(portfolioId: string): Promise<PortfolioData> {
  const [
    { data: portfolio },
    { data: theme },
    { data: hero },
    { data: about },
    { data: skills },
    { data: projects },
    { data: contact },
    { data: settings },
  ] = await Promise.all([
    supabase.from('portfolios').select('*').eq('id', portfolioId).single(),
    supabase.from('themes').select('*').eq('portfolio_id', portfolioId).eq('is_active', true).single(),
    supabase.from('hero').select('*').eq('portfolio_id', portfolioId).eq('is_active', true).single(),
    supabase.from('about').select('*').eq('portfolio_id', portfolioId).eq('is_active', true).single(),
    supabase.from('skills').select('*').eq('portfolio_id', portfolioId).eq('is_active', true).order('created_at', { ascending: true }),
    supabase.from('projects').select('*').eq('portfolio_id', portfolioId).eq('is_active', true).order('display_order'),
    supabase.from('contact').select('*').eq('portfolio_id', portfolioId).eq('is_active', true).single(),
    supabase.from('site_settings').select('*').eq('portfolio_id', portfolioId).single(),
  ]);

  return {
    portfolio,
    theme,
    hero,
    about,
    skills: skills || [],
    projects: projects || [],
    contact,
    settings,
  };
}

// ─── REALTIME SUBSCRIPTIONS ───

export function subscribeToPortfolioTable(
  portfolioId: string,
  table: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`${table}-${portfolioId}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `portfolio_id=eq.${portfolioId}`
      },
      callback
    )
    .subscribe();
}


// ─── ADMIN HELPERS ───

export interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// Check if current Supabase user is listed in admin_users
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user?.email) return false;

  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', user.email)
    .eq('is_active', true)
    .single();

  if (error) {
    // If no row found, error.code will be 'PGRST116'
    return false;
  }
  return !!data;
}

// Fetch all admin accounts
export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, email, full_name, role, is_active, last_login, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
  return (data || []) as AdminUser[];
}

// Create a new admin account (also creates Supabase Auth user)
export async function createAdminAccount(
  username: string,
  email: string,
  password: string,
  fullName: string,
  role: string = 'admin'
): Promise<{ success: boolean; error?: string }> {
  // 1. Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  // 2. Insert into admin_users
  const { error: insertError } = await supabase
    .from('admin_users')
    .insert({
      username,
      email,
      full_name: fullName,
      role,
      password_hash: 'managed-by-supabase-auth', // Auth handled by Supabase
      is_active: true,
    });

  if (insertError) {
    console.error('Error creating admin record:', insertError);
    return { success: false, error: 'Created auth user but failed to add admin record.' };
  }

  return { success: true };
}

// Update admin account
export async function updateAdminAccount(
  id: string,
  updates: Partial<Pick<AdminUser, 'full_name' | 'role' | 'is_active'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('admin_users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating admin:', error);
    return false;
  }
  return true;
}

// Soft-delete admin account
export async function deactivateAdminAccount(id: string): Promise<boolean> {
  return updateAdminAccount(id, { is_active: false });
}

// ─── PUBLIC READ (No auth required) ───

export async function getPublicPortfolio(slug: string): Promise<PortfolioData | null> {
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!portfolio) return null;

  return fetchAllPortfolioData(portfolio.id);
}