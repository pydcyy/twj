// 获得当前网站目录
var postUrl="http://api.tongwujie.cn/",
	weburl="http://api.tongwujie.cn/reg.php",
	appdown="http://api.tongwujie.cn/app.apk";
	// appkey=1;
//登录验证
loginRequired = function(callback){
	if(!getLoginStorage('$UserInfo')){
		openView('login.html', 'login.html');
	}else{
		callback();
	}
}

//获取地址验证
addressRequired = function(callback){
	var url=postUrl+"Home/member/getAddress.html";
	var postData = {};
	diyAjax(url,postData,function(result){
		console.log("查询地址");
		if(result.code == 1){
			//进入司机编辑资料页面
			callback(result);
		}
	},function(xhr){
		console.log("失败"+JSON.stringify(xhr));
	})
}
//获取银行卡
bankcardRequired = function(callback){
	var url=postUrl+"Home/member/getBanks.html";
	var postData = {};
	diyAjax(url,postData,function(result){
		console.log("查询银行卡");
		if(result.code == 1){
			//进入司机编辑资料页面
			callback(result);
		}
	},function(xhr){
		console.log("失败"+JSON.stringify(xhr));
	})
}
// 打开新页面
function openView(url,id,data){
	if(data==""){
		data = "";
	}
	mui.openWindow({
		url: url,
		id: id,
		preload: true,
		show: {
			aniShow: 'pop-in'
		},
		extras: data,
		styles: {
			popGesture: 'hide'
		},
		waiting: {
			autoShow: false
		}
	});
}
// HTTP_TOKEN
function getToken(){
	if(!getLoginStorage('$UserInfo')){
		return false;
	}else{
		return getLoginStorage('$UserInfo')['token'];
	}
}
// 获取uid
function getUid(){
	var user = getLoginStorage('$UserInfo');
	return user['id'];
}

// 获取key
function getAppKey(){
	return "V1.2";
	// return plus.runtime.version;
}

// 获取mobile
function getMobile(){
	var user = getLoginStorage('$UserInfo');
	if(user['mobile']){
		return user['mobile'];
	}else{
		showMessage("登录失效，请重新登录");
		openView('login.html', 'login.html');
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
function gobackRefreshTrue(){
	var list = plus.webview.currentWebview().opener();
	//触发列表界面的自定义事件（refresh）,从而进行数据刷新   
	mui.fire(list, 'refresha'); 
	//返回true，继续页面关闭逻辑     
}
function log(data){
	console.log(JSON.stringify(data));
}
function beforeOpenView(page,id,pageid){
	plus.nativeUI.showWaiting(); 
	webviewShow = plus.webview.create(page,'id',{},{pageid:pageid}); 
}

function afterOpenView(){
	var currentView = plus.webview.currentWebview();
	currentView.show('slide-in-right', 300);
	plus.nativeUI.closeWaiting();
}
// 封装ajax
function diyAjax(url,data,callback,errcallback){
	if(onNetChange()){
		
		var token = getToken();
		
		if(token){	
			data['token']=token;
		}

		
		if(getAppKey()){
			data['key']=getAppKey();
		}	
		//var mask=mui.createMask();//遮罩层
		return jQuery.ajax({
			url:url,
			dataType: 'json', 
			// headers:{'http-token':token},
			type: 'POST',
			timeout: 20000, 
			data:data,
			beforeSend: function() {
				plus.nativeUI.showWaiting();
				//mask.show();//显示遮罩层
			},
			complete: function() {
				plus.nativeUI.closeWaiting();
				//mask.close();//关闭遮罩层
			},
			success: function(result) { 
				if(result.code=="-667"){
					showMessage('登录失效，请重新登录!');
					localStorage.removeItem("$UserInfo");		
					openView('login.html','login.html');
					return false;
				}else if(result.code=="-666"){
					showMessage(result.msg);
					plus.ui.confirm(result.msg, function(i) {
						if (0 == i.index) {
							plus.runtime.openURL(appdown);
						}
// 						if (1 == i.index) {
// 							goback();
// 						}
					},"提 示", ["立即更新", "取消"]);
					return false;
				}
				callback(result);
			}, 
			error: function(xhr, type, errorThrown) { 
				if( eval('(' + xhr['responseText'] + ')')['code']==401){
					showMessage('登录失效，请重新登录!');
					localStorage.removeItem("$UserInfo");	
						
					openView('login.html','login.html');

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

// 判断设备类型
function isAndroid(){
	if(mui.os.ios){
		return false;
	}else{
		return true;
	}
}
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
// 		var timestamp = Date.parse(new Date()) / 1000;
// 		var expire_time = dataObj['expire_time'];
// 		// 1551426881  expire_time
// 		if (expire_time < timestamp) {
// 			return false;
// 		}else{
// 			return dataObj;
// 		}
		return dataObj;
	}
}
/*封装localStorage的时间*/

// 判断联网信息
function onNetChange() { 
	var nt = plus.networkinfo.getCurrentType();　　  
	if(nt == plus.networkinfo.CONNECTION_NONE) { 
		mui("button").button("reset");
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
    save_url = postUrl+"Home/member/login.html";
	diyAjax(save_url,postData,function(result){
		console.log("登录");
		if (result.code == 1) {
			//成功
			localStorage.setItem('$UserInfo', JSON.stringify(result['data']));

			showMessage(result.msg);	
			if(plus.webview.getWebviewById('nearby.html')){
				plus.webview.getWebviewById('nearby.html').hide();	
			}
			if(plus.webview.getWebviewById('wealth.html')){
				plus.webview.getWebviewById('wealth.html').hide();
			}
			if(plus.webview.getWebviewById('user.html')){
				plus.webview.getWebviewById('user.html').hide();
			}
			var indexPage =plus.webview.getLaunchWebview();
			indexPage.reload(true);
			indexPage.show("pop-in");
			
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
	if(postData["mobile"]==""){
		showMessage("请输入手机号码");
		thisButton.button("reset");
		return false;
	}else if(postData["password"]==""){
		showMessage("请输入密码");
		thisButton.button("reset");
		return false;
	}else if(postData["tcode"]==""){
		showMessage("请输入邀请码");
		thisButton.button("reset");
		return false;
	}
// 	if(postData["tcode"]==""){
// 		postData["tcode"]=0;
// 	}

    save_url = postUrl+"Home/member/reg.html";
	diyAjax(save_url,postData,function(result){
		console.log("注册");
		if (result.code == 1) {
			//成功
			localStorage.setItem('$UserInfo', JSON.stringify(result['data']));
			
			showMessage(result.msg);

			var indexPage =plus.webview.getLaunchWebview();
			if(plus.webview.getWebviewById('nearby.html')){
				plus.webview.getWebviewById('nearby.html').hide();	
			}
			if(plus.webview.getWebviewById('wealth.html')){
				plus.webview.getWebviewById('wealth.html').hide();
			}
			if(plus.webview.getWebviewById('user.html')){
				plus.webview.getWebviewById('user.html').hide();
			}

			
			indexPage.show("pop-in");
			thisButton.button("reset");
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
	if(postData["mobile"]==""){
		showMessage("请输入手机号码");
		thisButton.button("reset");
		return false;
	}else if(postData["password"]==""){
		showMessage("请输入新密码");
		thisButton.button("reset");
		return false;
	}
    save_url = postUrl+"Home/member/updatePwd.html";
	diyAjax(save_url,postData,function(result){
		console.log("忘记密码");
		if (result.code == 1) {
			//成功
			localStorage.setItem('$UserInfo', JSON.stringify(result['data']));
			showMessage(result.msg);

			var indexPage =plus.webview.getLaunchWebview();
			if(plus.webview.getWebviewById('nearby.html')){
				plus.webview.getWebviewById('nearby.html').hide();	
			}
			if(plus.webview.getWebviewById('wealth.html')){
				plus.webview.getWebviewById('wealth.html').hide();
			}
			if(plus.webview.getWebviewById('user.html')){
				plus.webview.getWebviewById('user.html').hide();
			}
			
			indexPage.show("pop-in");
			thisButton.button("reset");
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

function _update(){
	var postData = {};
    save_url = postUrl+"home/app/checkKEY";
	diyAjax(save_url,postData,function(result){
		console.log("检查更新");
		if (result.code == 1) {
			showMessage('通无界 已是最新版本~')
		} else {
			plus.ui.confirm(result.msg, function(i) {
				if (0 == i.index) {
					plus.runtime.openURL(appdown);
				}
			},"提 示", ["立即更新", "取消"]);
		}
		
	},function(xhr){
		console.log(JSON.stringify(xhr));
	});
				
}
function _layout(){
	console.log("退出登录");
	localStorage.removeItem("$UserInfo");
	openView('login.html','login.html')

// 	diyAjax(save_url," ",function(result){
// 		console.log("退出登录");
// 		if (result.code == 1) {
// 			//成功
// 			showMessage(result.msg);
// 			localStorage.removeItem("$driverInfo");
// 
// 			mui.openWindow({
// 				url: 'login.html',
// 				id: 'login',
// 			    show: {
// 					aniShow: 'pop-in'
// 				}
// 		    });
// 			return false;
// 		} else{
// 			// 失败
// 			showMessage(result.msg);
// 			return false;
// 		}
// 	},function(xhr){
// 		console.log(JSON.stringify(xhr));
// 	});
}
//添加银行卡
function _savecrad(thisButton){
    var postData =  getPostData();
	if(postData["name"]==""){
		showMessage("请输入姓名");
		thisButton.button("reset");
		return false;
	}else if(postData["bankid"]==""){
		showMessage("请输入卡号");
		thisButton.button("reset");
		return false;
	}else if(postData["bankname"]==""){
		showMessage("请输入开户行名称");
		thisButton.button("reset");
		return false;
	}
	postData["type"]=2;
    save_url = postUrl+"Home/member/editBanks.html";
	diyAjax(save_url,postData,function(result){
		if (result.code == 1) {
			//成
			showMessage(result.msg);
			gobackRefreshTrue();
			thisButton.button("reset");
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

//删除银行卡
function _delbankcard(id,index){
    var postData =  {};
	postData["type"]=1;
	postData["id"]=id;
    save_url = postUrl+"Home/member/editBanks.html";
	diyAjax(save_url,postData,function(result){
		console.log(result);
		if (result.code == 1) {
			//成
			showMessage(result.msg);
			$(".bankcard-list").eq(index).remove();
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
function _addaddress(flag){
	var postData =  getPostData();
	var save_url = postUrl+"Home/member/editAddress.html";
	
	if(flag=="del"){
		postData['type']="1";
	}
	diyAjax(save_url,postData,function(result){
		console.log("添加收货地址");
		showMessage(result.msg);
		
		if(result.code==1){
			gobackRefreshTrue();
			
			// beforeOpenView("address.html");
		}
		
		
	},function(xhr){
		console.log(JSON.stringify(xhr));
	});
	
	return false;  
}
function _transfer(thisButton){
    var postData =  getPostData();
	
	if(postData["mobile"]==""){
		showMessage("请输入转账手机号码");
		thisButton.button("reset");
		return false;
	}else if(postData["money"]==""){
		showMessage("请输入转账金额");
		thisButton.button("reset");
		return false;
	}
	
    save_url = postUrl+"Home/member/transfer.html";
	
	// 1=余额转账 2=积分转账 3=金铢转账
	postData["type"]=1;
	
	
	var data={};
	data["url"]=save_url;
	data["postData"]=postData;
	sureMessage("确定转账",function(){	
		// 支付密码验证
		localStorage.setItem('$pwdPost', JSON.stringify(data));
		beforeOpenView("payCode.html");
		console.log("转账");
		thisButton.button("reset");
	});	
}
function _setpaypwd(thisButton){
    var postData =  getPostData();
	
	if(postData["code"] == ""){
		showMessage("请输入验证码");
		thisButton.button("reset");
		return false;
		
	}else if(postData["epassword"] == ""){
		showMessage("请输入支付密码");
		thisButton.button("reset");
		return false;
	}else if(postData["epassword"].length != 6){
		showMessage("支付密码格式不正确");
		thisButton.button("reset");
		return false;
	}else if(postData["epassword"] != postData["reepassword"]){
		showMessage("两次输入的密码不一致");
		thisButton.button("reset");
		return false;
	}
	var dealData={};
	for (var data in postData){
		if(data=="reepassword") continue;
		dealData[data] = postData[data];
	}
	
	var save_url = postUrl+"Home/member/updatePayPwd.html";
	diyAjax(save_url,dealData,function(result){
		console.log("修改支付密码");
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
	
	return false;
}
//修改登录密码
function _setloginpwd(thisButton){
    var postData =  getPostData();
	
	if(postData["code"] == ""){
		showMessage("请输入验证码");
		thisButton.button("reset");
		return false;
	}else if(postData["password"] == ""){
		showMessage("请输入登录密码");
		thisButton.button("reset");
		return false;
	}else if(postData["password"] != postData["reepassword"]){
		showMessage("两次输入的密码不一致");
		thisButton.button("reset");
		return false;
	}
	var dealData={};
	for (var data in postData){
		if(data=="reepassword") continue;
		dealData[data] = postData[data];
	}
	//暂无接口
	var save_url = postUrl+"Home/member/updatePwd.html";
	diyAjax(save_url,dealData,function(result){
		console.log("修改登录密码");
		if (result.code == 1) {
			//成功
			showMessage(result.msg);
			openView('login.html','login.html')
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
	
	return false;
}
function _checkSecure(resultValue){
	var statics = getLoginStorage('$pwdPost');
	var url = statics['url'],
		data = statics['postData'];
	data['epassword'] = resultValue;
	
	diyAjax(url,data,function(result){
		if (result.code == 1) {
			//成功
			showMessage(result.msg);
			toIndex();
			return false;
		}else{
			// 失败
			showMessage(result.msg);
			//返回true,加载按钮
			return false;
		}
	},function(xhr){
		console.log(JSON.stringify(xhr));
	});

}

/**
* 从当前页面pop到目标页面
* @param {String} targetId 目标页面ID
*/
function popToTarget(targetId){
    //获取目标页面
    var target = plus.webview.getWebviewById(targetId);
    if (!target) {
        console.log("目标页面不存在！");
        return;
    }
    //获取当前页面
    var current = plus.webview.currentWebview();
    if (current === target) {
        console.log("目标页面是当前页面！");
        return;
    }
    //将要关闭的页面
    var pages = new Array(current);
    //父级页面
    var opener = current.opener();
    while (opener){
        if (opener === target) {//找到了目标页面
            //关闭目标页面的所有子级页面pages
            pages.map(function(page){
                page.close();
            });
            return;
        }
        pages.push(opener);
        opener = opener.opener();
    }
    //没有找到目标页面
    console.log("目标页面不是当前页面的祖先页面！");
}

function toIndex() {
	var all = plus.webview.all();
	var launch = plus.webview.getLaunchWebview() //基座，不可以关掉
	for(var i = 0; i < all.length; i++) {
		if(all[i] === launch)
			continue;
		all[i].close();
		all[i].clear();
	}
	//立刻退出
	setTimeout(function() {
		launch.show();　　//不要重新打开login，app的基座就是login页面，直接show出来就行了
	}, 0);
}
// 回到顶部
function toTop(){
	var topbtn = document.getElementById("gotop");
	var timer = null;    //获取屏幕的高度
	var pagelookheight = document.documentElement.clientHeight;
								 
	window.onscroll = function(){
		//滚动超出高度，显示按钮，否则隐藏
		var backtop = document.body.scrollTop;           //  滚动超过一频    应该显示
		if(backtop >= pagelookheight){
			topbtn.style.display = "block";
		}else{
			topbtn.style.display = "none";
		}
	}
								 
	topbtn.onclick = function () {
		timer = setInterval(function () {
			var backtop = document.body.scrollTop;             //速度操作  减速
			var speedtop = backtop/5;  
			document.body.scrollTop = backtop -speedtop;  //高度不断减少
			if(backtop ==0){  //滑动到顶端
				clearInterval(timer);  //清除计时器
			}
		}, 30);
	}
}
function getcaptchaAjax(account,type){	
	var url = postUrl+"Home/sms/index.html",
		data = {
			"mobile": account,
			"type":type,
		};
	diyAjax(url,data,function(result){
		console.log(JSON.stringify(result));
		if(result.code == 1){
			//用户存在
			var secondd = 300;
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
			showMessage(result.msg);
		}
	},function(xhr){
		console.log(JSON.stringify(xhr));
	});
}
/*输入框弹出框*/
function sureDeleteinput(title,data,callback,param1){
	var title = '' || title;
	var param1 = '' || param1;
	if($('.sureDelete').length){
		$('.sureDelete').remove();
	}
	var template = [
        '<div class="sureDelete">',
        	'<div class="sureDelete-content">',
        		'<div class="sureDelete-main">',
        			'<div class="sureDelete-title">'+title+'</div>',
        			'<div class="sureDelete-body">',
        				'<span></span><span class="sureDelete-data textColor"><input type="text" id="showinput" name="showinput" value="'+data+'"/></span>',
        			'</div>',
        			'<div class="sureDelete-footer btn-group">',
        				'<span class="next" onclick="sureDatainput('+callback+','+param1+');">确定</span>',
        				'<span class="back" onclick="unsureDatainput();">×</span>',
        			'</div>',
        		'</div>',
        		'<i></i>',
        	'</div>',
        	'<div class="sureDelete-bg"></div>',
        '</div>'
    ].join('');
	$('body').append(template);
	$('.sureDelete').fadeToggle(500); 
}
function sureDatainput(callback,param1){
	$('.sureDelete').fadeToggle(500); 

	$("#nickname").val($("#showinput").val());
	$(".nickname").text($("#showinput").val());


	var timer = window.setTimeout(function(){
		$('.sureDelete').remove();
		window.clearTimeout(timer); 
	},800);
	return true;
}
function unsureDatainput(){
	$('.sureDelete').fadeToggle(500); 
	var timer = window.setTimeout(function(){
		$('.sureDelete').remove();
		window.clearTimeout(timer); 
	},800); 
	return false;
}
$(function(){
	//验证码获取
	$('#yzmbtn').bind('click',function(){
		thisButton = mui(this);
		var mobile = $('#mobile').val();
		var type = $('#type').val();

		if(mobile == ''){
			showMessage('手机号不能为空');
			$("#mobile").focus();
			return false;
		}
        var url = postUrl+"Home/sms/index.html",
            data = {
                "mobile": mobile,
				"type":type,
            };
			
		thisButton.button("loading");
		
		diyAjax(url,data,function(result){
			console.log(JSON.stringify(result));
			$("#yzmbtn").attr("disabled","disabled");
			$("#yzmbtn").css("cursor","not-allowed");
			if(result.code == 1){
				//用户存在
				var secondd = 300;
				var timerr = null;
				timerr = setInterval(function(){
					secondd -= 1;
					if(secondd >0 ){
						$("#yzmbtn").text("倒计时"+secondd+"秒");
					}else{
						$("#yzmbtn").text("获取验证码");
						$("#yzmbtn").attr("disabled",false);
						$("#yzmbtn").css("cursor","pointer");
						clearInterval(timerr);	
					}
				},1000);
			}else{
				showMessage(result.msg);
				$("#yzmbtn").attr("disabled",false);
				$("#yzmbtn").css("cursor","pointer");
				thisButton.button("reset");
			}
		},function(xhr){
			console.log(JSON.stringify(xhr));
			thisButton.button("reset");
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
