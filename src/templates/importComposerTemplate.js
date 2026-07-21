const toBasicAuthHeader = ({ username = "", appPassword = "" } = {}) => {
  if (!username || !appPassword) return null;
  return `Basic ${Buffer.from(`${username}:${appPassword}`).toString("base64")}`;
};

const importComposerTemplate = async (manifest, options = {}) => {
  const url = options.url || options.pushUrl;
  if (!url) {
    throw new Error("Missing import URL.");
  }

  if (typeof fetch !== "function") {
    throw new Error("Global fetch is not available in this Node runtime.");
  }

  const authHeader = toBasicAuthHeader(options);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(options.headers || {}),
    },
    body: JSON.stringify(manifest),
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (_error) {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(`Template import failed with ${response.status}.`);
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return {
    ok: true,
    status: response.status,
    data,
  };
};

module.exports = {
  importComposerTemplate,
  toBasicAuthHeader,
};
