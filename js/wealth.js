		
(function($, doc) {
	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: { //下拉刷新
				callback: pulldownRefresh,
				style: mui.os.android ? "circle" : "default"
			}
		}
	});

	
	mui.plusReady(function() {
	})

	function pulldownRefresh() {

		appPage.endPullRefresh();
	}
}(mui, document))