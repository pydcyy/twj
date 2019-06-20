function phoneCode(phone="123456"){
	var string1 = reverse(phone.substr(0,3));
	var string2 = reverse(phone.substr(3,4));
	var string3 = reverse(phone.substr(7,4));
	
	var result = string1+"9"+string3+"8"+string2;
	return result;
}
function enPhoneCode(phone="123456"){
	var string1 = reverse(phone.substr(0,3));
	var string2 = reverse(phone.substr(4,4));
	var string3 = reverse(phone.substr(9,4));
	
	var result = string1+string3+string2;
	return result;
}
var reverse = function( str ){
   var stack = [];//生成一个栈
   for(var len = str.length,i=len;i>=0;i-- ){
       stack.push(str[i]);
    }
    return stack.join('');
};