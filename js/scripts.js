App = {};

(function(){
	var pubnub;
	var ans={
		A : 0,
		B : 0,
		C : 0
	};
	App.init = function(){
		var name = $("#name").val();

		if (name === ""){
			alert("Please enter a valid name");
			return;
		}

		pubnub = PUBNUB.init({
		    publish_key: 'pub-c-4dc7dfa6-28c9-4096-95e6-b10aa8b3a30f',
		    subscribe_key: 'sub-c-123e02c8-2861-11e6-84f2-02ee2ddab7fe',
		    uuid: name,
		    error: function (error) {
		        console.log('Error:', error);
		    }
		})

		pubnub.subscribe({
		    channel : "users",
		    presence : function(m){
		        switch(m.action){
		    		case "join":
		    			App.addUser(m);
		    		break;
		    		case "timeout":
		    		case "leave":
		    			App.removeUser(m);
		    		break;
		    		default:x
		    	}
		    },
		    message : function(m){
		    	App.displayQuestion(m);
		    	$(".submitBtn").prop("disabled",false);
		    }
		});
		pubnub.subscribe({
		    channel : "answers",
		    message : function(m){
		        App.updateAnswer(m);
		        $(".tally").append(JSON.stringify(ans));
		    }
		});

		$(".connectBtn").prop("disabled",true);
	}

	App.submitAnswer = function(){
		var msg = $("#formQuestion input[type='radio']:checked").val();
		pubnub.publish({
		    channel : 'answers',
		    message : msg,
		    callback : function(m){
		    }
		});
		$(".submitBtn").prop("disabled",true);
	}

	App.updateAnswer = function(data){
		ans[data]++;
		$("#progress"+data).css("width",ans[data]*10);
	}

	App.submitQuestion = function(){
		var q = $("#question");
		var a1 = $("#ans1");
		var a2 = $("#ans2");
		var a3 = $("#ans3");
		var msg = {
			q: q.val(),
			a1: a1.val(),
			a2: a2.val(),
			a3: a3.val(),
		};

		pubnub.publish({
		    channel : 'users',
		    message : JSON.stringify(msg),
		    callback : function(m){
		       	ans={
					A : 0,
					B : 0,
					C : 0
				};

				$("#progressA").css("width",ans[data]*10);
				$("#progressB").css("width",ans[data]*10);
				$("#progressC").css("width",ans[data]*10);
		    }
		});

	}

	App.displayQuestion = function(data){
		data = JSON.parse(data);
		$("#question").val(data.q);
		$("#optionsRadios1text").text(data.a1);
		$("#optionsRadios2text").text(data.a2);
		$("#optionsRadios3text").text(data.a3);
	}

	App.addUser = function(data){
		var html = '<li data-uuid="'+data.uuid+'"><a href="#">'+data.uuid+'</a></li>';
		$("#users ul").append(html);
	}

	App.removeUser = function(data){
		$("#users ul li[data-uuid="+data.uuid+"]").remove();
	}

	App.unsubscribe = function(){
		pubnub.unsubscribe({
		    channel : 'users',
		});
	}

	App.loadQuestionFromHistory = function(){
		pubnub.history({
		    channel : 'users',
		    callback : function(m){
		        console.log(m[0][0]);

		        App.displayQuestion(JSON.stringify(m[0][0]));
		    	$(".submitBtn").prop("disabled",false);
		    },
		    count : 1,
		    reverse : false
		});
	}

	window.onunload = window.onbeforeunload = App.unsubscribe;

})();