# Thanks for the feedback

A tool to help people gather anonymous feedback on themselves for self improvement.

## tldr
```
docker run --name thanks-for-the-feedback --restart=always -p 1443:8000 -v ~/Projects/thanks-for-the-feedback/:/app -d lerignoux/thanks-for-the-feedback
```

## Dbs
Two databases (sqlLite & postgres) are pre-supported by the container but any should be configurable.
just configure your settings accordingly and link t the database if necessary.


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
