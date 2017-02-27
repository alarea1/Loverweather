//动作设置//
var xAngle = 0, yAngle = 0;
document.addEventListener('keydown', function(e)
{
  switch(e.keyCode)
  {

      case 37: // left
          yAngle -= 90;
          break;

      case 38: // up
          xAngle += 90;
          break;

      case 39: // right
          yAngle += 90;
          break;

      case 40: // down
          xAngle -= 90;
          break;
  };

  document.getElementById('cube').style.webkitTransform = "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)";
}, false);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////数据请求及页面dom操作/////////////////////////////////////////////////////////////
'use strict';

///////////参数设置主要是路径//////////////////
let weatherAPI = 'weather';
let hourlyAPI  = 'forecast';
let dailyAPI   = 'forecast/daily';
let imgAPI     = 'http://openweathermap.org/img/w/';
let imgType    = '.png';
let wFlag = true;
let hFlag = true;


///////////默认加载北京////////////////////////
$(document).ready(function(){
    //请求数据 北京 若输入请求新数据//
    dataRequest('beijing');
    $('.search-btn').on('click', function() {
    let searchKey = $('.search-key').val();
    if(searchKey==''){alert("please enter your city!");}
    else{
      if (wFlag || hFlag) {
      dataRequest2(searchKey);
      wFlag = false;
      hFlag = false;

      }
    }


  });
});


// $('.clear').on('click',function(){
//   $('.weather2')[0].innerHTML="";
//   //$('.city2')[0].innerHTML="";
//   $('.picture2')[0].innerHTML="";
//   $('.time2')[0].innerHTML="";
//   $('.temp2')[0].innerHTML="";
//   $('.description2')[0].innerHTML="";
//   $('.wind-speed2')[0].innerHTML="";
//   $('.wind-deg2')[0].innerHTML="";
//
//   $('#weather-cloudiness2')[0].innerHTML="";
//   $('#weather-pressure2')[0].innerHTML="";
//   $('#weather-humidity2')[0].innerHTML="";
//   $('#weather-sunrise2')[0].innerHTML="";
//   $('#weather-sunset2')[0].innerHTML="";
//   $('#weather-geo2')[0].innerHTML="";
//   $('.daily-forecast2')[0].innerHTML="";
//
// });
/////////数据请求函数调用getData，之后进行setInfo/////////////////////////
function dataRequest(searchKey){
    getData(weatherAPI, searchKey).done(function(data){
      setWeatherInfo(data);

    });
    getData(dailyAPI, searchKey).done(function(data){
      $('.daily-forecast').empty();
  		setDailyForecast(data);

    });
}
function dataRequest2(searchKey){
    getData(weatherAPI, searchKey).done(function(data){
      setWeatherInfo2(data);
      wFlag = true;
    });
    getData(dailyAPI, searchKey).done(function(data){
      $('.daily-forecast2').empty();
  		setDailyForecast2(data);
  		dFlag = true;
    });
}
/////////////getData函数,ajax///////////////////////////////

function getData(pathName,searchKey){
    let appId = '489646e192394f377c0d39c76399cf49';
    return $.ajax({
    url: `http://api.openweathermap.org/data/2.5/${pathName}`,
      type: 'GET',
      data:{
        'q': searchKey,
  			'units': 'metric',
  			'appid': appId
      }
    });

}
////////////////////////////////////////////////////////////////

function setWeatherInfo(dataSource) {

	let country  = dataSource.sys.country;                  //国家
	let cityName = dataSource.name;							//城市
	let imgName  = dataSource.weather[0].icon;				//图片名
	let imgSrc   = `${imgAPI}${imgName}${imgType}`;			//图片URL
	let des      = dataSource.weather[0].description;		//描述
	let timeStr  = dataSource.dt;					//时间
	let time     = dateInfo(timeStr);
	let wind     = numberFixed(dataSource.wind.speed);		//风速
	//let windType = windLevel(wind);
	let degree   = dataSource.wind.deg;						//风向
	//let windStr = `${windDirection(degree)} ( ${degree} )`;
	let temp     = numberFixed(dataSource.main.temp);		//温度
	let pressure = dataSource.main.pressure;				//气压
	let humidity = dataSource.main.humidity;				//湿度
	let geo      = dataSource.coord;						//经纬度
	let sunrise  = dataSource.sys.sunrise;					//日出时间
	let sunset   = dataSource.sys.sunset;					//日落时间
	let sunriseTime = timeFormat(sunrise);
	let sunsetTime  = timeFormat(sunset);

	$('.city').text(`Weather in ${cityName}, ${country}`);
	$('.picture').attr('src', imgSrc);
	$('.temp>span').text(`${temp} °C`);
	$('.description').text(des);
	$('.time').text(time);
	//$('.wind-speed').text(`${windType} ${wind}m/s`);
	//$('.wind-deg').text(windStr);
	$('#weather-cloudiness').text(des);
	$('#weather-pressure').text(`${pressure} hpa`);
	$('#weather-humidity').text(`${humidity}%`);
	$('#weather-sunrise').text(sunriseTime);
	$('#weather-sunset').text(sunsetTime);
	$('#weather-geo').text(`[${geo.lat},${geo.lon}]`);
}
function numberFixed(num) {

	return num.toFixed(1);
}
/////////////////////最近预报//////////////////////
function setDailyForecast(dataSource) {

	let data = dataSource.list;
	let htmlStr = '';

	for (let i = 0; i < 4; i++) {

		let time = data[i].dt;
		let dateString = dateInfo(time);
		let imgName = data[i].weather[0].icon;
		let dayTemp = numberFixed(data[i].temp.day);
		let nightTemp = numberFixed(data[i].temp.night);
		let rainDes = data[i].weather[0].description;
		let windSpeed = data[i].speed;
		let cloud = data[i].clouds;
		let pressure = data[i].pressure;

		htmlStr += `<tr><td class="daily-date">${dateString}
				    <img src="${imgAPI}${imgName}${imgType}"></td>
		   		    <td class="daily-weather-info"><div class="daily-top">`;

		if (parseFloat(dayTemp) < 0) {

			htmlStr += `<span class="blue-bg">`;  //最高温度负数时 蓝色
		} else {

			htmlStr += `<span class="orange-bg">`;
		}

	    htmlStr += `${dayTemp} °C</span><span class="gray-bg">${nightTemp} °C</span>
		           <i>${rainDes}</i></div><div class="daily-middle">${windSpeed}</div>
		           <div class="daily-bottom">clouds: ${cloud}% , ${pressure} hpa
		           </div></td></tr>`;
	}

	$('.daily-forecast').append(htmlStr);
}
//////////日期格式, like: Thu 20 Aug///////
function timeFormat(t) {

	let time = new Date(t * 1000);
	let hour = time.getHours();
	let minute = time.getMinutes();
	let minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
	let timeString = hour < 10 ? `0${hour}:${minuteStr}` : `${hour}:${minuteStr}`;
	return timeString;
}

function dateInfo(date) {

	let temp = new Date(date * 1000);
	let month = monthFormat(temp.getMonth());
	let day   = dayFormat(temp.getDay());
	let dateStr = `${day} ${temp.getDate()} ${month}`;
	return dateStr;
}
////////月份///////
function monthFormat(m) {

	let monthArr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	return monthArr[m];
}

/////////星期//////////
function dayFormat(d) {

	let dayArr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	return dayArr[d];
}


//////////////////////////////////////////////////////
function setWeatherInfo2(dataSource) {

	let country  = dataSource.sys.country;                  //国家
	let cityName = dataSource.name;							//城市
	let imgName  = dataSource.weather[0].icon;				//图片名
	let imgSrc   = `${imgAPI}${imgName}${imgType}`;			//图片URL
	let des      = dataSource.weather[0].description;		//描述
	let timeStr  = dataSource.dt;					//时间
	let time     = dateInfo(timeStr);
	let wind     = numberFixed(dataSource.wind.speed);		//风速
	//let windType = windLevel(wind);
	let degree   = dataSource.wind.deg;						//风向
	//let windStr = `${windDirection(degree)} ( ${degree} )`;
	let temp     = numberFixed(dataSource.main.temp);		//温度
	let pressure = dataSource.main.pressure;				//气压
	let humidity = dataSource.main.humidity;				//湿度
	let geo      = dataSource.coord;						//经纬度
	let sunrise  = dataSource.sys.sunrise;					//日出时间
	let sunset   = dataSource.sys.sunset;					//日落时间
	let sunriseTime = timeFormat(sunrise);
	let sunsetTime  = timeFormat(sunset);

	$('.city2').empty().text(`Weather in ${cityName}, ${country}`);
	$('.picture2').empty().attr('src', imgSrc);
	$('.temp2>span').empty().text(`${temp} °C`);
	$('.description2').empty().text(des);
	$('.time2').empty().text(time);
	//$('.wind-speed2').text(`${windType} ${wind}m/s`);
	//$('.wind-deg2').text(windStr);
	$('#weather-cloudiness2').empty().text(des);
	$('#weather-pressure2').empty().text(`${pressure} hpa`);
	$('#weather-humidity2').empty().text(`${humidity}%`);
	$('#weather-sunrise2').empty().text(sunriseTime);
	$('#weather-sunset2').empty().text(sunsetTime);
	$('#weather-geo2').empty().text(`[${geo.lat},${geo.lon}]`);
}
function numberFixed(num) {

	return num.toFixed(1);
}
/////////////////////最近预报//////////////////////
function setDailyForecast2(dataSource) {

	let data = dataSource.list;
	let htmlStr = '';

	for (let i = 0; i < 4; i++) {

		let time = data[i].dt;
		let dateString = dateInfo(time);
		let imgName = data[i].weather[0].icon;
		let dayTemp = numberFixed(data[i].temp.day);
		let nightTemp = numberFixed(data[i].temp.night);
		let rainDes = data[i].weather[0].description;
		let windSpeed = data[i].speed;
		let cloud = data[i].clouds;
		let pressure = data[i].pressure;

		htmlStr += `<tr><td class="daily-date">${dateString}
				    <img src="${imgAPI}${imgName}${imgType}"></td>
		   		    <td class="daily-weather-info"><div class="daily-top">`;

		if (parseFloat(dayTemp) < 0) {

			htmlStr += `<span class="blue-bg">`;  //最高温度负数时 蓝色
		} else {

			htmlStr += `<span class="orange-bg">`;
		}

	    htmlStr += `${dayTemp} °C</span><span class="gray-bg">${nightTemp} °C</span>
		           <i>${rainDes}</i></div><div class="daily-middle">${windSpeed}</div>
		           <div class="daily-bottom">clouds: ${cloud}% , ${pressure} hpa
		           </div></td></tr>`;
	}

	$('.daily-forecast2').append(htmlStr);
}
