module.exports = (req, res, next) => {
  const referer = req.get('Referer');
  if (!referer || !referer.includes('https://blogverse-beta.vercel.app/')) {
    return res.status(403).json({ message: "Нет доступа" })
  }
  next();
}