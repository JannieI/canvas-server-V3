
## Some Docs on how to handle MySQL

    Ubuntu
        - to see if running: systemctl status mysql.service
        - to get running again:
             systemctl unmask mysql.service
             service mysql start
                If permissions issues:
        - sudo /etc/init.d/mysql start
        - sudo /etc/init.d/mysql restart
        - sudo systemctl start mysql
                To see if running, etc:
        - service mysql status
        - service mysql stop
        - service mysql start
                MySQL defaults to port 3306 unless you specify another line in the /etc/my.cnf config e.
        To change it:
        - Log in to your server using SSH.
        - At the command prompt, use your preferred text editor to open the /etc/mysql/my.cnf e.
          ie vi /etc/my.cnf
        - Locate the bind-address line in the my.cnf file.
                Alter Password with
        - ALTER USER 'userName'@'localhost' IDENTIFIED BY 'New-Password-Here';
