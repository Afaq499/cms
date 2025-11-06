const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

exports.protect = (roles = []) => {
  return (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden: Access denied" });
      }

      next();
    } catch (err) {
      res.status(401).json({ error: "Token invalid or expired" });
    }
  };
};
