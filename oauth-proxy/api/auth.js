export default function handler(req, res) {
  const { GITHUB_CLIENT_ID, OAUTH_REDIRECT_URI } = process.env;
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: "repo,user",
    redirect_uri: OAUTH_REDIRECT_URI,
  });
  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
  });
  res.end();
}
