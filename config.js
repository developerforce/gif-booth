const config = {
  AWS_ACCESS_KEY_ID:
    process.env.BUCKETEER_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  AWS_REGION: process.env.BUCKETEER_AWS_REGION || process.env.AWS_REGION,
  AWS_SECRET_ACCESS_KEY:
    process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME:
    process.env.BUCKETEER_BUCKET_NAME || process.env.AWS_BUCKET_NAME,
  AUTH_USERNAME: process.env.AUTH_USERNAME || 'admin',
  AUTH_PASSWORD: process.env.AUTH_PASSWORD,
}

module.exports = config
