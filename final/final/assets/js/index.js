//ad
    var slideIndex =0;
    var timer =null;
    
    autoPlay(true);

    function plusSlides(n){
    showSlides(slideIndex+=n);
    }

    function currentSlides(n){
    showSlides(slideIndex=n);
    }

    function showSlides(n){
    var slide = document.getElementsByClassName("slide");
    var dot = document.getElementsByClassName("dot");

    clearTimeout(timer);

    if(n>=slide.length){
        slideIndex=0;
    }
    if(n<0){
        slideIndex=slide.length-1;
    }

    for(var i=0;i<slide.length;i++){
        slide[i].style.display="none";
    }

    slide[slideIndex].style.display="block";

    for(var i=0;i<dot.length;i++){
        dot[i].className=dot[i].className.replace(" active","");
    }
    
    dot[slideIndex].className+=" active";
    }

    function autoPlay(isFirst){
        var slide=document.getElementsByClassName("slide");
        if(isFirst){
        slideIndex=0;
        }else{
        slideIndex++;
        }

        if(slideIndex>=slide.length){
        slideIndex=0;
        }
        showSlides(slideIndex);
        timer = setTimeout(autoPlay,3000);

    }
