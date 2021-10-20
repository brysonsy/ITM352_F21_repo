date = 1;
month = 9;
year = 2000;

s1 = year % 100;
s2 = Math.floor(s1 % 4);
s3 = s2 + s1;
s4 = 5;
s6 = s4 + s3;
s7 = s6 + date;
s8 = s7 - 1;
s9 = s8 % 7;

var weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

console.log(`My birthday falls on a ${weekday[s9]}.`)