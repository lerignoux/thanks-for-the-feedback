# Thanks for the feedback

[![Known Vulnerabilities](https://snyk.io/test/github/lerignoux/thanks-for-the-feedback/badge.svg?targetFile=requirements.txt)](https://snyk.io/test/github/lerignoux/thanks-for-the-feedback?targetFile=requirements.txt)

A tool to help people gather anonymous feedback on themselves for self improvement.

## tldr
```
docker run --name thanks-for-the-feedback --restart=always -p 1443:8000 -v ~/projects/thanks-for-the-feedback/:/app -d lerignoux/thanks-for-the-feedback
```

## Dbs
Two databases (sqlLite & postgres) are pre-supported by the container but any should be configurable.
just configure your settings accordingly and link to the database if necessary.

### migration:
after container start run:
```
python manage.py mirate
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

## Contributions
All ideas, contributions, bugs, fixes are welcome. Please follow the usual github and open source recommendations for contributing.

## Thanks
A special He Yawen for her design ideas & corrections and [Alexis Rolland](https://github.com/alexisrolland) for his support, suggestions, tests and ideas.
