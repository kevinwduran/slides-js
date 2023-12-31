export default class Slide {
    constructor(wrapper, slide) {
        this.wrapper = document.querySelector(wrapper);
        this.slide = document.querySelector(slide);
        this.dist = {
            finalPosition: 0,
            startX: 0,
            movement: 0,
        }
    }

    bindEvents() {
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
    }

    moveSlide(distX) {
        this.dist.movePosition = distX;
        this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
    }

    updatePosition(clientX) {
        this.dist.movement = (this.dist.startX - clientX) * 1.6;
        return this.dist.finalPosition - this.dist.movement;
    }

    onStart(event) {
        let moveType;
        //para desktop
        if (event.type === 'mousedown') {
            event.preventDefault();
            this.dist.startX = event.clientX;
            moveType = 'mousemove'
        } else { //quando for touch (mobile)
            this.dist.startX = event.changedTouches[0].clientX;
            moveType = 'touchmove'
        } 
        this.wrapper.addEventListener(moveType, this.onMove);
    }

    onMove(event) {
        //ternário para ver se é desktop ou mobile
        const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX;
        const finalPosition = this.updatePosition(pointerPosition);
        this.moveSlide(finalPosition);
    }

    onEnd(event) {
        const moveType = (event.type === 'mouseup') ? 'mousemove' : 'touchmove';
        this.wrapper.removeEventListener(moveType, this.onMove);
        this.dist.finalPosition = this.dist.movePosition;
    }

    addSlideEvent() {
        this.wrapper.addEventListener('mousedown', this.onStart);
        this.wrapper.addEventListener('touchstart', this.onStart);//mobile, igual ao mousedown
        this.wrapper.addEventListener('mouseup', this.onEnd);
        this.wrapper.addEventListener('touchend', this.onEnd);//mobile, igual ao mouseup
    }

    calcSlidePosition(slide) {
        //tamanho da tela total - tamanho do slide / 2, isto dá as bordas/margins do slide
        const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
        return -(slide.offsetLeft - margin);
    }

    // Slides Config
    slidesConfig() {
        //transforma a ul em um array, contendo todas as li
        this.slideArray = [...this.slide.children].map((element) => {
            const positionItem = this.calcSlidePosition(element);
            return { positionItem, element };
        });
    }

    slidesIndexNav(index) {
        const lastSlide = this.slideArray.length - 1;
        console.log(lastSlide)
        this.index = {
            prevSlide: index ? index - 1 : undefined, // se for o primeiro slide[0], dará false, logo o prev será undefined
            actualSlide: index,
            nextSlide: index === lastSlide ? undefined : index + 1
        }
    }

    changedSldie(index) {
        const activeSlide = this.slideArray[index];
        this.moveSlide(activeSlide.positionItem);
        this.slidesIndexNav(index);
        this.dist.finalPosition = activeSlide.positionItem;
    }

    // Inicializar
    init() {      
        this.bindEvents();
        this.addSlideEvent();
        this.slidesConfig();
        return this;
    }
}