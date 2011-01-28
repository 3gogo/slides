define([], function() {
	
	var body = document.body,
		supportsTouch = 'ontouchstart' in body,
		undef;
		
	function setHash(slide) {
		window.location.hash = '#' + slide;
	}
	
	function getHash() {
		var h = window.location.hash;
		return h.length > 1 && h[0] === '#' ? (1*h.substring(1)) : 0;
	}
	
	function stopEvent(e) {
		e.preventDefault();
		e.stopPropagation();
	}
	
	function initTouchEvents(slideView) {
		body.ontouchstart = function(e) {
			var x = e.targetTouches[0].pageX,
				y = e.targetTouches[0].pageY,
				moved = false;

			body.ontouchmove = function(e) {
				moved = true;
			};
			
			body.ontouchend = function(e) {
				var ret = true;
				try {
					if(e.changedTouches.length === 1) {
						var next;

						if(moved) {
							var dx = e.changedTouches[0].pageX - x,
								dy = e.changedTouches[0].pageY - y;

							if(Math.abs(dx) > Math.abs(dy)) {
								stopEvent(e);
								next = dx <= 0;
							}
							
							ret = false;
							
						} else {
							stopEvent(e);
							next = e.changedTouches[0].pageX > (window.innerWidth/2);
						}

						if(next != undef) {
							setTimeout(function() {
								slideView[next ? 'next' : 'prev']().then(success);
							}, 0);
						}

					}

					return ret;
					
				} finally {
					moved = false;
					body.ontouchend = null;
					body.ontouchmove = null;
				}
			};
			
			return true;
		};
		
	}
	
	function success(result) {
		setHash(result.slide);
	}

	return function PresentationController(slideView) {
		body.className += " presentation-loading";
		
		window.onkeyup = function(e) {
			var key = (window.event) ? event.keyCode : e.keyCode,
				ret = true;
			switch(key) {
				case 37: // Left arrow
				// case 38: // Up arrow, used for keyboard scrolling
					slideView.prev().then(success);
					stopEvent(e);
					ret = false;
					break;
				case 32: // Space
				case 39: // Right arrow
				// case 40: // Down arrow, used for keyboard scrolling
					slideView.next().then(success);
					stopEvent(e);
					ret = false;
					break;
			}
			
			return ret;
		};
		
		// Goto first slide
		slideView.go(getHash()).then(function() {
			body.className = body.className.replace(/presentation-loading/g, "");
		});
		
		if('onhashchange' in window) {
			window.onhashchange = function(e) {
				slideView.go(getHash());
			};
		}
		
		if(supportsTouch) {
			initTouchEvents(slideView);
		}
	};
});