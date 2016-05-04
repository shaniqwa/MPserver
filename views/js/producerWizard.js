$('#slider1 , #slider2 ,  #slider3,  #slider4,  #slider5').slider({
	formatter: function(value) {
		return 'value: ' + value;
	}
});

