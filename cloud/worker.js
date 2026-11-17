const OWNER = "abdallhgamer";
const REPO = "abdallhgamer.github.io";
const BRANCH = "main";
const ALLOWED_ORIGIN = "https://abdallhgamer.github.io";

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin"
    }
  });
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", {status:403});
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    if (request.method !== "POST") {
      return json({error:"Method not allowed"},405,origin);
    }

    try {
      if (!env.GITHUB_TOKEN) {
        return json({error:"توکن انتشار تنظیم نشده است."},500,origin);
      }

      const body = await request.json();
      const name = String(body.name || "").toLowerCase();
      const html = String(body.html || "");

      if (!/^[a-z0-9][a-z0-9_-]{0,39}$/.test(name)) {
        return json({error:"نام صفحه معتبر نیست."},400,origin);
      }

      if (!html.trim() || html.length > 100000) {
        return json({error:"کد خالی یا بیش از حد بزرگ است."},400,origin);
      }

      const path = `cloud/${name}.html`;
      const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

      const headers = {
        "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Abdallah-Cloud"
      };

      const existing = await fetch(`${api}?ref=${BRANCH}`,{headers});

      if (existing.status === 200) {
        return json({error:"این نام قبلاً استفاده شده است. نام دیگری انتخاب کن."},409,origin);
      }

      if (existing.status !== 404) {
        return json({error:"بررسی مخزن GitHub ناموفق بود."},502,origin);
      }

      const saved = await fetch(api,{
        method:"PUT",
        headers:{
          ...headers,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          message:`Create page ${name}`,
          content:toBase64(html),
          branch:BRANCH
        })
      });

      if (!saved.ok) {
        return json({error:"ذخیره در GitHub انجام نشد. تنظیمات مخزن را بررسی کن."},502,origin);
      }

      return json({
        success:true,
        url:`https://${OWNER}.github.io/cloud/${name}.html`
      },200,origin);

    } catch (error) {
      return json({error:"خطای سرور: "+error.message},500,origin);
    }
  }
};
