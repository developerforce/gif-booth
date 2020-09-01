# GIF Booth
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

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

  ## 🤝 Contributing

We love contributions, small or big, from others!

Please see our [CONTRIBUTING](https://github.com/fostive/.github/blob/main/CONTRIBUTING.md) guidelines. The first thing to do is to discuss the change you wish to make via issue, email, or any other method with the owners of this repository.

Also, please review our [code of conduct](https://github.com/fostive/.github/blob/main/CODE_OF_CONDUCT.md). Please adhere to it in all your interactions with this project.

Thanks goes to these wonderful ✨ people ([emoji key](https://allcontributors.org/docs/en/emoji-key)) for contributing to the project:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://crc.io"><img src="https://avatars3.githubusercontent.com/u/275734?v=4" width="100px;" alt=""/><br /><sub><b>Chris Castle</b></sub></a><br /><a href="https://github.com/fostive/gif-booth/commits?author=crcastle" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Code of Conduct

Please review and adhere to our [CODE_OF_CONDUCT.md](https://github.com/fostive/.github/blob/main/CODE_OF_CONDUCT.md) before contributing to this project in any way (e.g. creating an issue, writing code, etc).

## 📝 License

This project is licensed under the Creative Commons Zero v1.0 License. See the [LICENSE](LICENSE) file for details.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!