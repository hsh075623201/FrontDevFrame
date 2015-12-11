# copy from ebay martin-liu

* Pure HTML/CSS/JS
* For Client/Service separately SPA(Single Page Application)

## Setup

**manual way**:
  * Install git, nodejs
  * If you already have a repository
    + Go to your repository directory
    + `git remote add bp git@github.corp.ebay.com:opsins/angular-boilerplate.git`
    + `git pull bp master`
  * Or you can fork this project, and run `git clone YOUR_REPO_URL`
  * `sudo npm -g install grunt-cli karma bower`
  * `npm install && bower install && grunt init`

**Note**:
  * You can use `git config --global url."https://".insteadOf git://` to solve possible network issue
  * For **Windows** environment, you must install msysgit correctly, and run `bower install` from the Windows Command Prompt. This is the limitation of Bower only

## Development
  * Run `grunt start`, this will start a static server on http://localhost:8000, and also run watch tasks. You can run `grunt watch` only if the directory is already under a web server

## Documentation
Please see [wiki](https://github.com/martin-liu/m-angular-boilerplate/wiki)

### Highlight
* Static file server for quick development
* Dev/test/build process
* CacheBust, minify, uglify
* Livereload
* Animation
* Modular && Inheritance support
* Resueable UI functions/components
* Local cache, persistence
* Global error handler
* Travis build && auto push to github pages
  - Go to GitHub.com -> Settings -> Applications -> Personal Access Tokens — > Create new token, and copy it to your clipboard
  - In `.travis.yml` file, Change `GH_REF` value to your repository
  - `npm install travis-encrypt -g`
  - `travis-encrypt -r [repository slug] GH_TOKEN=[the token you created before]`, repository slug is for example `martin-liu/m-angular-boilerplate`
  - copy the long encrypt string to `.travis.yml`
