FROM python:3.6.4-alpine

MAINTAINER Erignoux Laurent <lerignoux@gmail.com>

RUN mkdir /app
WORKDIR /app

ADD ./requirements.txt /app/
RUN pip install -r requirements.txt

CMD ["python", "manage.py", "runserver", "0:8000"]
