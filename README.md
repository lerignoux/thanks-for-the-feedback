# Thanks for the feedback

A tool to help people gather anonymous feedback on themselves for self improvement.

## tldr
```
docker build -t thanks-for-the-feedback .
docker run --name thanks-for-the-feedback --restart=always -p 1443:8000 -v ~/Projects/thanks-for-the-feedback/:/app -d thanks-for-the-feedback
```

## Register social auth:
see [Providers configuration](http://django-allauth.readthedocs.io/en/latest/providers.html)
fill for each provider the (ensure you set https prefix in site configuration in admin)
home page with `https://<host>`
callback with `https://<host>/accounts/google/login/callback/`

## Sass:
to rebuild the css from sass:

```
sass --watch static/sass/main.scss:static/css/main.css
```
