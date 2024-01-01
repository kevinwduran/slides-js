import SlideNav from './slide.js';

const slide = new SlideNav('.slide-wrapper', '.slide');
slide.init();

slide.addControl('.custom-control');
slide.addArrow('.prev', '.next')

