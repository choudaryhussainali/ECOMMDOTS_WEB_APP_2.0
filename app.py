import os
import re
import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, session, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from supabase import create_client, Client
from dotenv import load_dotenv

# ──────────────────────────────────────────────
# ENVIRONMENT & APP BOOTSTRAP
# ──────────────────────────────────────────────
load_dotenv()  # Loads .env for local dev — silently ignored on Vercel

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'ecommdots_million_dollar_vault_key_2026')

# ──────────────────────────────────────────────
# SUPABASE CLIENT — safe initialisation
# ──────────────────────────────────────────────
SUPABASE_URL              = os.environ.get('SUPABASE_URL', '').strip()
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '').strip()

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise EnvironmentError(
        "\n\n[ECOMMDOTS CMS] FATAL: Supabase credentials are missing.\n"
        "Create a .env file from .env.example and fill in your keys.\n"
        "On Vercel: Project Settings → Environment Variables.\n"
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# ──────────────────────────────────────────────
# STARTUP: seed admin user if not yet in DB
# ──────────────────────────────────────────────
def ensure_master_admin():
    """
    Creates the admin user in Supabase if it doesn't exist yet.
    Safe to call on every startup — does nothing if user already exists.
    Mirrors the original SQLite ensure_master_admin() exactly.
    """
    try:
        resp = (
            supabase.table('users')
            .select('id')
            .eq('username', 'admin')
            .limit(1)
            .execute()
        )
        if not resp.data:
            hashed_pw = generate_password_hash('EliteCMS2026!')
            supabase.table('users').insert({
                'username': 'admin',
                'password': hashed_pw
            }).execute()
            print("[ECOMMDOTS] Master admin user created in Supabase.")
    except Exception as e:
        print(f"[ECOMMDOTS] Warning: could not seed admin user — {e}")
        print("[ECOMMDOTS] Make sure you ran supabase_setup.sql in the Supabase SQL Editor.")


# ──────────────────────────────────────────────
# UTILITIES
# ──────────────────────────────────────────────

def generate_slug(title: str) -> str:
    """Converts a blog title into a clean, SEO-optimised URL slug."""
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug


def rows_to_dicts(rows):
    """Returns rows as a list of dicts, or [] if None."""
    return rows if rows else []


# ──────────────────────────────────────────────
# 1. PUBLIC ROUTES (FRONTEND)
# ──────────────────────────────────────────────

# ==========================================
# MAIN AGENCY ROUTES
# ==========================================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/testimonials')
def testimonials():
    return render_template('testimonials.html')

@app.route('/career')
def career():
    return render_template('career.html')

@app.route('/privacy_policy')
def privacy_policy():
    return render_template('privacy_policy.html')

@app.route('/terms_of_service')
def terms_of_service():
    return render_template('terms_of_services.html')

@app.route('/blog')
def blog_grid():
    """Homepage: first 10 articles + category counts."""
    try:
        articles_resp = (
            supabase.table('articles')
            .select('*')
            .order('created_at', desc=True)
            .limit(10)
            .execute()
        )
        articles = rows_to_dicts(articles_resp.data)

        total_resp = (
            supabase.table('articles')
            .select('id', count='exact')
            .execute()
        )
        total_articles = total_resp.count if total_resp.count is not None else len(articles)

        cat_resp = (
            supabase.table('articles')
            .select('category')
            .execute()
        )
        cat_counts: dict = {}
        for row in (cat_resp.data or []):
            cat = row.get('category', '')
            if cat:
                cat_counts[cat] = cat_counts.get(cat, 0) + 1

    except Exception as e:
        print(f"[ECOMMDOTS] Homepage DB error: {e}")
        articles      = []
        total_articles = 0
        cat_counts    = {}

    return render_template(
        'blog_grid.html',
        articles=articles,
        total_articles=total_articles,
        cat_counts=cat_counts
    )


@app.route('/api/load_more')
def load_more():
    """
    Async API for pagination + category filtering.
    Contract (identical to original SQLite version):
      Query params  : ?offset=<int>&category=<str|'all'>
      Response body : HTML fragment (_blog_loop.html)
      Response hdrs : X-Total-Count, X-Returned-Count
    """
    try:
        offset = int(request.args.get('offset', 0))
    except (ValueError, TypeError):
        offset = 0

    category = request.args.get('category', 'all')
    limit    = 10

    try:
        if category == 'all':
            articles_resp = (
                supabase.table('articles')
                .select('*')
                .order('created_at', desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            total_resp = (
                supabase.table('articles')
                .select('id', count='exact')
                .execute()
            )
        else:
            articles_resp = (
                supabase.table('articles')
                .select('*')
                .eq('category', category)
                .order('created_at', desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            total_resp = (
                supabase.table('articles')
                .select('id', count='exact')
                .eq('category', category)
                .execute()
            )

        articles     = rows_to_dicts(articles_resp.data)
        total_in_cat = total_resp.count if total_resp.count is not None else 0

    except Exception as e:
        print(f"[ECOMMDOTS] load_more DB error: {e}")
        articles     = []
        total_in_cat = 0

    html_fragment = render_template('_blog_loop.html', articles=articles)

    response = make_response(html_fragment)
    response.headers['X-Total-Count']    = total_in_cat
    response.headers['X-Returned-Count'] = len(articles)
    return response


@app.route('/blog/<string:slug>')
def article_view(slug):
    """Single article page — looks up by slug."""
    try:
        resp = (
            supabase.table('articles')
            .select('*')
            .eq('slug', slug)
            .limit(1)
            .execute()
        )
        if not resp.data:
            return render_template('404_vault.html'), 404

        return render_template('article.html', article=resp.data[0])

    except Exception as e:
        print(f"[ECOMMDOTS] article_view error for slug '{slug}': {e}")
        return render_template('404_vault.html'), 404


# ──────────────────────────────────────────────
# 2. ADMIN CMS — SECURE COMMAND CENTER
# ──────────────────────────────────────────────

@app.route('/admin-login', methods=['GET', 'POST'])
def admin_login():
    """Secure login gateway."""
    error_message = None

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        try:
            resp = (
                supabase.table('users')
                .select('*')
                .eq('username', username)
                .limit(1)
                .execute()
            )

            if resp.data:
                stored_hash = resp.data[0].get('password', '')
                try:
                    password_valid = check_password_hash(stored_hash, password)
                except Exception:
                    password_valid = False   # malformed hash — treat as wrong password

                if password_valid:
                    session['logged_in'] = True
                    session['username']  = username
                    return redirect(url_for('admin_dashboard'))

            error_message = 'Access Denied. Invalid credentials.'

        except Exception as e:
            print(f"[ECOMMDOTS] admin_login DB error: {e}")
            error_message = (
                'Database error. Make sure the Supabase users table exists '
                '(run supabase_setup.sql) and credentials are correct.'
            )

    flash_html = (
        f'<div style="background:#7f1d1d;color:#fff;padding:12px;border-radius:4px;'
        f'margin-bottom:15px;font-size:13px;">{error_message}</div>'
        if error_message else ''
    )

    return f'''<!DOCTYPE html>
    <html lang="en"><head><meta charset="UTF-8"><title>CMS Login — Ecommdots</title></head>
    <body style="background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
        <div style="background:#111;padding:40px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);width:100%;max-width:350px;box-shadow:0 20px 40px rgba(0,0,0,0.5),0 0 40px rgba(217,35,45,0.1);">
            <h2 style="margin-top:0;font-weight:800;letter-spacing:2px;">CMS <span style="color:#d9232d;">ECOMMDOTS</span></h2>
            {flash_html}
            <form method="post" style="display:flex;flex-direction:column;gap:15px;">
                <input type="text" name="username" placeholder="Username" required
                    style="background:#050505;border:1px solid #333;color:#fff;padding:12px;outline:none;border-radius:4px;">
                <input type="password" name="password" placeholder="Password" required
                    style="background:#050505;border:1px solid #333;color:#fff;padding:12px;outline:none;border-radius:4px;">
                <button type="submit"
                        style="background:#d9232d;color:#fff;border:none;padding:14px;font-weight:bold;letter-spacing:1px;cursor:pointer;margin-top:10px;border-radius:4px;">
                    LOGIN
                </button>
            </form>
        </div>
    </body></html>'''


@app.route('/admin', methods=['GET', 'POST'])
def admin_dashboard():
    """The Command Center: publish and manage articles."""
    if not session.get('logged_in'):
        return redirect(url_for('admin_login'))

    # ── Handle new article submission ──
    if request.method == 'POST':
        try:
            title         = request.form['title']
            category      = request.form['category']
            subcategory   = request.form['subcategory']
            read_time     = request.form['read_time']
            excerpt       = request.form['excerpt']
            content       = request.form['content']
            author_name   = request.form['author_name']
            author_image  = request.form['author_image']
            thumbnail_url = request.form['thumbnail_url']
            is_wide       = 'is_wide'     in request.form
            is_featured   = 'is_featured' in request.form
            slug          = generate_slug(title)
            publish_date  = datetime.datetime.now().strftime("%B %Y")

            existing = (
                supabase.table('articles')
                .select('id')
                .eq('slug', slug)
                .limit(1)
                .execute()
            )

            if existing.data:
                flash('Deploy Failed: An article with a similar title or slug already exists.')
            else:
                supabase.table('articles').insert({
                    'title':         title,
                    'slug':          slug,
                    'category':      category,
                    'subcategory':   subcategory,
                    'read_time':     int(read_time),
                    'publish_date':  publish_date,
                    'excerpt':       excerpt,
                    'content':       content,
                    'author_name':   author_name,
                    'author_image':  author_image,
                    'thumbnail_url': thumbnail_url,
                    'is_wide':       is_wide,
                    'is_featured':   is_featured,
                }).execute()
                flash('Masterpiece successfully deployed to the live grid.')

        except Exception as e:
            print(f"[ECOMMDOTS] admin POST error: {e}")
            flash(f'Deploy Failed: {str(e)}')

    # ── Load article list ──
    try:
        articles_resp = (
            supabase.table('articles')
            .select('id, title, category, publish_date, slug')
            .order('created_at', desc=True)
            .execute()
        )
        articles = rows_to_dicts(articles_resp.data)
    except Exception as e:
        print(f"[ECOMMDOTS] admin GET error: {e}")
        articles = []
        flash(f'Could not load articles: {str(e)}')

    return render_template('admin.html', articles=articles)


# ── CRITICAL: parameter name must be "id" to match admin.html template ──
# admin.html uses: url_for('delete_article', id=article.id)
# So the route parameter MUST be named "id" — not "article_id"
@app.route('/admin/delete/<int:id>', methods=['POST'])
def delete_article(id):
    """Permanently purges an article from Supabase."""
    if not session.get('logged_in'):
        return redirect(url_for('admin_login'))

    try:
        supabase.table('articles').delete().eq('id', id).execute()
        flash('Digital asset permanently destroyed.')
    except Exception as e:
        print(f"[ECOMMDOTS] delete_article error: {e}")
        flash(f'Delete Failed: {str(e)}')

    return redirect(url_for('admin_dashboard'))


@app.route('/admin/logout')
def logout():
    session.clear()
    return redirect(url_for('admin_login'))


# ──────────────────────────────────────────────
# CONTEXTUAL 404 ROUTING
# ──────────────────────────────────────────────

@app.errorhandler(404)
def page_not_found(e):
    if request.path.startswith('/article/') or request.path.startswith('/blog'):
        return render_template('404_vault.html'), 404
    return render_template('404_agency.html'), 404


# ──────────────────────────────────────────────
# ENTRY POINT
# ──────────────────────────────────────────────

if __name__ == '__main__':
    ensure_master_admin()   # Seeds admin user if missing — same as original SQLite version
    app.run(debug=False)