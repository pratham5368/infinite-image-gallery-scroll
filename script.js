gsap.registerPlugin(ScrollTrigger);

let iteration = 0;
const spacing = 0.05,
  snap = gsap.utils.snap(spacing),
  cards = gsap.utils.toArray(".cards li"),
  seamlessLoop = buildSeamlessLoop(cards, spacing),
  scrub = gsap.to(seamlessLoop,{
    totalTime: 10,
    duration: 0.5,
    ease: "power3",
    paused: true,
  });


  trigger = ScrollTrigger.create({
    start: 0,
    onUpdate(self){
        if(self.progress === 1 && self.direction >0 && !self.wrapping){
            wrapForward(self);
        } else if (
            self.progress < 1e-5 &&
            self.direction < 0 &&
            !self.wrapping 
        ) {
            wrapBackward(self);
        }else{
            scrub.vars.totalTime = snap(
                (iteration + self.progress) * seamlessLoop.duration()
            );
            scrub.invalidate().restart();
            self.wrapping = false;
        }
    },
    end: "+=3000",
    pin: ".gallery",
  });

  function wrapForward(trigger){
    iteration++;
    trigger.wrapping = true;
    trigger.scroll(trigger.start + 1);
  }

  function wrapBackward(trigger){
    iteration--;
    if(iteration < 0){
        iteration = 9;
        seamlessLoop.totalTime(
            seamlessLoop.totalTime() + seamlessLoop.duration()*10
        );
        scrub.pause();
    }
    trigger.wrapping = true;
    trigger.scroll(trigger.start - 1);
  }

  function buildSeamlessLoop(items, spacing){
    let overlap = Math.ceil((1 / spacing)*2),
      startTime= items.length*spacing + 0.5,
      loopTime = (items.length + overlap) * spacing +1,
      rawSequence = gsap.timeline({paused: true}),
      seamlessLoop = gsap.timeline({
        paused: true,
        repeat: -1,
        onRepeat(){
            this._time === this._dur && (this._tTime += this._dur - 0.05);
        },
    });
    
    (l = items.length + overlap * 2),(time = 0), i, index, item;

    gsap.set(items, { yPercent: 400, opacity:1, scale: 0});

    for(i = 0; i < l; i++){
        index = i % items.length;
        item = items[index];
        time = i * spacing;
        rawSequence.fromTo(item, {opacity:1, scale: 0}, {
            scale: 1, opacity:1, zIndex: 100,duration: 0.5,yoyo: true, repeat: 1,ease: "power1.in", immediateRender: false,
        },
        time)

        .fromTo(item, {yPercent: 300}, {
            yPercent: -200,
            duration: 1,
            ease: "none",
            immediateRender: false,
        }, time);

        i <= items.length && seamlessLoop.add("label" + i, time);
    }

    rawSequence.time(startTime);
    seamlessLoop.to(rawSequence, {
        duration: loopTime- startTime,
        time: loopTime,
        ease: "none",
    })
    .fromTo(rawSequence, {time: overlap + spacing*1}, {
        time: startTime,
        duration: startTime - (overlap + spacing*1),
        immediateRender: false,
        ease: "none",
    }
    );
    return seamlessLoop;
  }


/*

  
  */