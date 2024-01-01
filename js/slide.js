import debounce from "./debounce.js";// para resize

export class Slide {
    constructor(wrapper, slide) {
        this.wrapper = document.querySelector(wrapper); //div
        this.slide = document.querySelector(slide); //ul com li's e img's
        this.dist = {
            finalPosition: 0,
            startX: 0,
            movement: 0,
        }
        this.activeClass = 'active';
        this.changeEvent = new Event('changeEvent');
    }

    //eventos que precisam de bind: callbacks
    bindEvents() {
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.activePrevSlide = this.activePrevSlide.bind(this);
        this.activeNextSlide = this.activeNextSlide.bind(this);
        this.onResize = debounce(this.onResize.bind(this), 200);
    }

    // método para transição, recebe true e false
    // antes de clicar em algum slide o valor está como true (init), ao clicar e mover: false (onStart)
    // ao soltar o mouse: true (onEnd)
    transition(active) {
        this.slide.style.transition = active ? 'transform .3s' : '';
    }

    //método que move o slide para o local desejado
    moveSlide(distX) {
        this.dist.movePosition = distX; //valor do slide
        this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
    }

    //método que ajuda na mudança de slide
    updatePosition(clientX) {
        this.dist.movement = (this.dist.startX - clientX) * 1.6;//acelera a mudança em 1.6
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
        this.transition(false);
    }

    onMove(event) {
        //ternário para ver se é desktop ou mobile
        const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX;
        const finalPosition = this.updatePosition(pointerPosition);
        this.moveSlide(finalPosition);
    }

    // método após soltar o slide
    onEnd(event) {
        const moveType = (event.type === 'mouseup') ? 'mousemove' : 'touchmove';
        this.wrapper.removeEventListener(moveType, this.onMove); //rem
        this.dist.finalPosition = this.dist.movePosition;
        this.transition(true);
        this.changeSlideOnEnd();
    }

    changeSlideOnEnd() {
        if (this.dist.movement > 120 && this.index.nextSlide !== undefined) {
            this.activeNextSlide();
        } else if (this.dist.movement < -120 && this.index.prevSlide !== undefined) {
            this.activePrevSlide();
        } else {
            this.changedSlide(this.index.actualSlide);
        }
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
            //retorna a posição de cada slide e o elemento de cada slide (li)
            return { positionItem, element };
        });
    }

    slidesIndexNav(index) {
        const lastSlide = this.slideArray.length - 1;
        this.index = {
            prevSlide: index ? index - 1 : undefined, // se for o primeiro slide[0], dará false, logo o prev será undefined
            actualSlide: index,
            nextSlide: index === lastSlide ? undefined : index + 1
        }
    }

    changedSlide(index) {
        const activeSlide = this.slideArray[index];//retorna o positionItem (poisção do Slide) e o slide em si (li)      
        this.moveSlide(activeSlide.positionItem);
        this.slidesIndexNav(index);
        this.dist.finalPosition = activeSlide.positionItem;
        this.changeActiveClass();
        this.wrapper.dispatchEvent(this.changeEvent);
    }

    // Classe ativa
    changeActiveClass() {
        //remove a classe ativo dos slides nãoa ativos
        this.slideArray.forEach((slide) => {
            slide.element.classList.remove(this.activeClass);
        })
        //adiciona classe ativo no slie ativo
        this.slideArray[this.index.actualSlide].element.classList.add(this.activeClass);
    }

    // Resize
    onResize() {
        setTimeout(() => {
            this.slidesConfig();
            this.changedSlide(this.index.actualSlide);
        }, 1000);
    }

    addResizeEvent() {
        window.addEventListener('resize', this.onResize);
    }

    // Navigation
    activePrevSlide() {
        if (this.index.prevSlide !== undefined) {
            this.changedSlide(this.index.prevSlide)
        }
    }

    activeNextSlide() {
        if (this.index.nextSlide !== undefined) {
            this.changedSlide(this.index.nextSlide)
        }
    }

    // Inicializar
    init() {      
        this.bindEvents();
        this.addSlideEvent();
        this.slidesConfig();
        this.transition(true);
        this.addResizeEvent();
        this.changedSlide(0);
        return this;
    }
}

export default class SlideNav extends Slide {
    constructor(slide, wrapper) {
        super(slide, wrapper);
        this.bindControls();
    }
    // Mover para frente e para trás
    addArrow(prev, next) {
        this.prevElement = document.querySelector(prev);
        this.nextElement = document.querySelector(next);
        this.addArrowEvent();
    }

    addArrowEvent() {
        this.prevElement.addEventListener('click', this.activePrevSlide);
        this.nextElement.addEventListener('click', this.activeNextSlide);
    }

    // Paginação

    criarControle() {
        const control = document.createElement('ul');
        control.dataset.control = 'slide';

        this.slideArray.forEach((item, index) => {
            control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`;
        });
        this.wrapper.appendChild(control);
        return control;
    }

    eventControl(item, index) {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            this.changedSlide(index);
        });
        this.wrapper.addEventListener('changeEvent', this.activeClassControl);
    }

    addControl(customControl) {
        this.control = document.querySelector(customControl) || this.criarControle();
        this.controlArray = [...this.control.children]; //array com todas as li's do ul
        this.controlArray.forEach(this.eventControl);
        this.activeClassControl();
    }

    activeClassControl() {
        this.controlArray.forEach((item) => item.classList.remove(this.activeClass));
        this.controlArray[this.index.actualSlide].classList.add(this.activeClass);
    }

    bindControls() {
        this.eventControl = this.eventControl.bind(this);
        this.activeClassControl = this.activeClassControl.bind(this);
    }
}