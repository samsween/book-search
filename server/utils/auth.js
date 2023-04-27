const jwt = require("jsonwebtoken");
const secret = process.env.SECRET || "secret"
const signToken = (user) => {
  const token = jwt.sign({ data: user }, secret , {
    expiresIn: "1h",
  });
  return token;
};

const expiration = "2h";
const authMiddleware = ({ req }) => {
  let token = req.body.token || req.query.token || req.headers.authorization;
  if (req.headers.authorization) {
    token = token.split(" ").pop().trim();
  }
  if (!token) {
    return req;
  }
  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
  } catch {
    console.log("Invalid token");
  }

  return req;
};

module.exports = { signToken, authMiddleware };
