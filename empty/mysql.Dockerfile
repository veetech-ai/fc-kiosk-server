FROM mysql:latest

RUN echo "sql-mode=''" >> /etc/mysql/conf.d/custom.cnf

 