# GIF Booth

Add animated GIFs and Family Photo to your virtual events!

## Installation

### Client

``` bash
cd client/
npm install
```

### Server

``` bash
npm install
```

### Requirements

#### S3

In order to use the GIF Booth app you'll need access to a S3 bucket in AWS, you can have it through [Heroku Elements](https://elements.heroku.com) using [Bucketeer](https://elements.heroku.com/addons/bucketeer), or providing your own.

If you are using your own S3 instance please provide the following configuration parameters as environment variables:

* `AWS_ACCESS_KEY_ID`
* `AWS_REGION`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_BUCKET_NAME`
* `AWS_BUCKET_URL`

#### ffmpeg

GIF Booth uses ffmpeg to do video processing, you'll need to have `ffmpeg` installed on your computer. On Heroku we will use the [heroku-buildpack-ffmpeg-latest](https://elements.heroku.com/buildpacks/jonathanong/heroku-buildpack-ffmpeg-latest), more instructions on how to use it on the Deployment section.

### Configuration

Currently, GIF Booth doesn't have an admin interface but it provide an URL endpoint for image moderation, if you want to use this feature please provide the following configuration parameters as environment variables:

* `AUTH_USERNAME` - (Default: `admin`)
* `AUTH_PASSWORD`

## Running Locally

``` bash
npm start
```

## Deployment

1. Create an Heroku application:
  ``` bash
  heroku create <app-name>
  ```

2. Add the `ffmpeg` buildpack:
  ``` bash
  heroku buildpacks:add -a <app-name> -i=1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
  ```

3. Add the `heroku/nodejs` buildpack:
  ``` bash
  heroku buildpacks:add -a <app-name> -i=2 heroku/nodejs
  ```

4. (Optional) Add the Bucketeer addon (Note: $5/month)
  ``` bash
  heroku addons:create bucketeer:hobbyist
  ```

5. Deploy to Heroku
  ```
  git push heroku main
  ```