export default async function handler(req, res) {
  const { code } = req.query;
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SITE_URL } = process.env;

  if (!code) {
    res.status(400).send("Missing code parameter");
    return;
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      res.status(400).send(`OAuth error: ${data.error_description || data.error}`);
      return;
    }

    // Return token to Decap CMS via postMessage
    const html = `<!DOCTYPE html>
<html><head><script>
  window.opener.postMessage(
    { token: "${data.access_token}", provider: "github" },
    "${SITE_URL}"
  );
  window.close();
</script></head><body><p>Authorization successful. Closing window...</p></body></html>`;

    res.status(200).send(html);
  } catch (err) {
    res.status(500).send(`Token exchange failed: ${err.message}`);
  }
}
