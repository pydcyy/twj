// 获得当前网站目录
var postUrl="http://api.tongwujie.cn/",
	photoweb="http://yangzifu.cn:8080/uploads/driver/",
	key=1;
//登录验证
loginRequired = function(callback){
	if(!getLoginStorage('$driverInfo')){
		plus.webview.open('login.html', 'login', {}, 'slide-in-right', 200);
	}else{
		callback();
	}
}
//获取资料验证
editRequired = function(callback){
	var url=postUrl+"/api/driver/getDetail";
	
	diyAjax(url,"",function(result){
		console.log(JSON.stringify(result));
		if(result.code == 1){
			//进入司机编辑资料页面
			callback(result);
		}else{
			//进入司机注册资料页面
			sureMessage('您还未注册司机信息，请先注册',function(){
				plus.webview.open('driverInfo.html', 'driverInfo', {}, 'slide-in-right', 200);
			});
		}
	},function(xhr){
		console.log("失败"+JSON.stringify(xhr));
	})
}
// HTTP_TOKEN
function getToken(){
	if(!getLoginStorage('$driverInfo')){
		return false;
	}else{
		return getLoginStorage('$driverInfo')['token'];
	}
}
//返回父页面
function goback(){
	var ws = plus.webview.currentWebview();
	plus.webview.close(ws);
}
//返回父页面并且刷新
function gobackRefresh(){
	mui.back();
}
// 封装ajax
function diyAjax(url,data,callback,errcallback){
	if(onNetChange()){
		var token = getToken();
		return jQuery.ajax({
			url:url,
			dataType: 'json', 
			headers:{'http-token':token},
			type: 'POST',
			timeout: 20000, 
			data:data,
			success: function(result) { 
				callback(result);
			}, 
			error: function(xhr, type, errorThrown) { 
				if( eval('(' + xhr['responseText'] + ')')['code']==401){
					showMessage('登录失效，请重新登录!');
					localStorage.removeItem("$driverInfo");		
					mui.openWindow({
						url: 'login.html',
						id: 'login',
					    show: {
							aniShow: 'pop-in'
						}
					});
					errcallback(xhr);
				}else{
					errcallback(xhr);
				}	
			} 
		})
	}
}
/*普通弹框*/
function showMessage(message){
	plus.nativeUI.toast("<font style=\"font-size:14px\">"+message+"</font>", {type:'richtext',duration:'long',richTextStyle:{align:'center',color:'#ff0000'}});
}
/*确认弹出框*/
function sureMessage(message,callback){
	plus.nativeUI.confirm(message,function(e){
		if(e.index == '0'){
			callback();
		}
		return false;
	});
}
/*function inputMessage(){
	plus.nativeUI.prompt( "输入此次交易金额", function(e){
		if(e.index==0){
			alert("确认");
		}else{
			alert("取消");
		}
	},"", "", ["确认","取消"]);
}*/
// 区域代码转为区域名称
function getNameByCode(code){
	var dataPro = code.toString().substring(0, 2);
	var dataCity = code.toString().substring(2, 4);
	var dataCountry = code.toString().substring(4, 6);
	
	var cityName = "";
	cityData3.forEach(function(obj,i){
		var data1=obj.value.substring(0, 2);
		if(data1==dataPro){
			cityName = cityName+obj.text+" ";
			obj.children.forEach(function(cbj,j){
				var data2=cbj.value.substring(2, 4);
				if(data2==dataCity){
					cityName = cityName+cbj.text+" ";
					cbj.children.forEach(function(ccbj,k){
						var data3=ccbj.value.substring(4, 6);
						if(data3==dataCountry){
							cityName = cityName+ccbj.text;
						}
					})
				}
			})
			
		}
	})
	if(cityName != ""){
		return cityName;
	}else{
		return "编码不存在";
	}	
}

// 选择日期
function pickDate(obj){
	plus.nativeUI.pickDate( function(e){
		var d=e.date;
		if((d.getMonth()+1+'').length == 1){
			var month = '0'+(d.getMonth()+1);
		}else{
			var month = (d.getMonth()+1);
		}
		obj.value=d.getFullYear()+"-"+month+"-"+d.getDate();
	},function(e){
		obj.value="";
	});
}
// 选择time
function pickTime(obj){
	plus.nativeUI.pickTime( function(e){
		var d=e.date;
		obj.value=d.getHours()+":"+d.getMinutes();
	},function(e){
		obj.value="";
	});
}
/*封装localStorage的时间*/
function getStorage(key,exp){
	var data = localStorage.getItem(key);
	var dataObj = JSON.parse(data);
	if(data==null){
		return false;
	}else{
		if (new Date().getTime() - dataObj.time>exp) {
			return false;
		}else{
			var dataObjDatatoJson = JSON.parse(dataObj.data)
			return dataObjDatatoJson;
		}
	}
}
function getLoginStorage(key){
	var key = localStorage.getItem(key);

	if(key==null){
		return false;
	}else{	
		var dataObj = JSON.parse(key);
		var timestamp = Date.parse(new Date()) / 1000;
		var expire_time = dataObj['expire_time'];
		// 1551426881  expire_time
		if (expire_time < timestamp) {
			return false;
		}else{
			return dataObj;
		}
	}
}
/*封装localStorage的时间*/

// 判断联网信息
function onNetChange() { 
	var nt = plus.networkinfo.getCurrentType();　　  
	if(nt == plus.networkinfo.CONNECTION_NONE) {  
		showMessage('请检查网络连接！');
		return false;
	} else {  
		return true;
	}  
}  
// 获得提交数据
function getPostData(){
	var data = $("#normal-form").serializeArray();
	var postData = {};
	$(data).each(function(i) {
	    var name_sub = this.name.substring(this.name.length-2,this.name.length);
	    var sub_name = "";
	    if(name_sub == '[]'){
	        sub_name = this.name.substring(0,this.name.length-2);
	    }else{
	        sub_name = this.name;
	    }
	    if(postData[sub_name]){
	        postData[sub_name] = postData[sub_name] +","+ this.value;
	    }else{
	        postData[sub_name] = this.value;
	    }
	});
	return postData;
}
//所有提交方法
function _login(thisButton){
    var postData =  getPostData();
	
	if(postData["mobile"]==""){
		showMessage("请输入手机号码");
		thisButton.button("reset");
		return false;
	}else if(postData["password"]==""){
		showMessage("请输入密码");
		thisButton.button("reset");
		return false;
	}
	postData["key"]=key;
    save_url = postUrl+"Home/member/login.html";
	diyAjax(save_url,postData,function(result){
		console.log("登录");
		if (result.code == 1) {
			//成功
			localStorage.setItem('$UserInfo', JSON.stringify(result['data']));
			showMessage(result.msg);
			plus.webview.open('index.html', 'index', {}, 'slide-in-right', 200);			
			thisButton.button("reset");
			return false;
		}else{
			// 失败
			showMessage(result.msg);
			//返回true,加载按钮
			thisButton.button("reset");
			return false;
		}
	},function(xhr){
		thisButton.button("reset");
		console.log(JSON.stringify(xhr));
	});

}
function _reg(thisButton){
    var postData =  getPostData();
	if(postData["account"]==""){
		showMessage("请输入手机号码");
		thisButton.button("reset");
		return false;
	}else if(postData["password"]==""){
		showMessage("请输入密码");
		thisButton.button("reset");
		return false;
	}
    save_url = postUrl+"/api/driver/register";
	diyAjax(save_url,postData,function(result){
		console.log("注册");
		if (result.code == 1) {
			//成功
			showMessage(result.msg);
			mui.back();
			return false;
		} else{
			// 失败
			showMessage(result.msg);
			thisButton.button("reset");
			return false;
		}
	},function(xhr){
		thisButton.button("reset");
		console.log(JSON.stringify(xhr));
	});
}
function _forgetpwd(thisButton){
    var postData =  getPostData();
	if(postData["account"]==""){
		showMessage("请输入手机号码");
		thisButton.button("reset");
		return false;
	}else if(postData["password"]==""){
		showMessage("请输入密码");
		thisButton.button("reset");
		return false;
	}
    save_url = postUrl+"/api/driver/forget";
	diyAjax(save_url,postData,function(result){
		console.log("忘记密码");
		if (result.code == 1) {
			//成功
			showMessage(result.msg);
			mui.back();
			return false;
		} else{
			// 失败
			showMessage(result.msg);
			thisButton.button("reset");
			return false;
		}
	},function(xhr){
		thisButton.button("reset");
		console.log(JSON.stringify(xhr));
	});
				
}
function _layout(){
	save_url = postUrl+"/api/driver/logout";

	diyAjax(save_url," ",function(result){
		console.log("退出登录");
		if (result.code == 1) {
			//成功
			showMessage(result.msg);
			localStorage.removeItem("$driverInfo");

			mui.openWindow({
				url: 'login.html',
				id: 'login',
			    show: {
					aniShow: 'pop-in'
				}
		    });
			return false;
		} else{
			// 失败
			showMessage(result.msg);
			return false;
		}
	},function(xhr){
		console.log(JSON.stringify(xhr));
	});
}
// 获取手机号码
function getAccount(){
	var telephone = getLoginStorage('$driverInfo');
	return telephone['account'];
}
function getcaptchaAjax(account,type){	
	var url = postUrl+"/api/sms/sendCaptcha",
		data = {
			"account": account,
			"type":type,
		};
	diyAjax(url,data,function(result){
		console.log(JSON.stringify(result));
		if(result.code == 1){
			//用户存在
			var secondd = 60;
			var timerr = null;
			timerr = setInterval(function(){
				secondd -= 1;
				if(secondd >0 ){
					$(".nocat").text(secondd+"s后重新发送");
				}else{
					$(".nocat").html(`<span>没收到验证码，重新发送></span>`);
					clearInterval(timerr);	
				}
			},1000);
		}else{
			$(".nocat").html(`<span>没收到验证码，重新发送></span>`);
			showMessage(result.showMessage);
		}
	},function(xhr){
		console.log(JSON.stringify(xhr));
	});
}

$(function(){
	//验证码获取
	$('#check-btn').bind('click',function(){
		var token = getToken();
		var account = $('#account').val();
		var type = $('#type').val();

		if(account == ''){
			showMessage('手机号不能为空');
			$("#account").focus();
			return false;
		}
        var url = postUrl+"/api/sms/sendCaptcha",
            data = {
                "account": account,
				"type":type,
            };
		diyAjax(url,data,function(result){
			console.log(JSON.stringify(result));
			$("#check-btn").attr("disabled","disabled");
			$("#check-btn").css("cursor","not-allowed");
			if(result.code == 1){
				//用户存在
				var secondd = 300;
				var timerr = null;
				timerr = setInterval(function(){
					secondd -= 1;
					if(secondd >0 ){
						$("#check-btn").val("倒计时"+secondd+"秒");
					}else{
						$("#check-btn").val("获取验证码");
						$("#check-btn").attr("disabled",false);
						$("#check-btn").css("cursor","pointer");
						clearInterval(timerr);	
					}
				},1000);
			}else{
				showMessage(result.showMessage);
				$("#check-btn").attr("disabled",false);
				$("#check-btn").css("cursor","pointer");
			}
		},function(xhr){
			console.log(JSON.stringify(xhr));
		});

	})
	
	//睁眼闭眼
	$('#eye-btn').bind('click',function(){
		if($(this).hasClass('eye-color')){
			$(this).removeClass('eye-color');
			$(this).siblings('input').attr('type','password');
		}else{
			$(this).addClass('eye-color');
			$(this).siblings('input').attr('type','text');
		}
	});
})
