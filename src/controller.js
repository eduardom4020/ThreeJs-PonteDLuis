export class Controller {
    constructor(slides=1, screenMeasures={}) {
        this.slidesAmt = slides;
        this.slideHeight = window.innerHeight;
        this.pageHeight = window.innerHeight * slides;

        const body = document.getElementsByTagName('body')[0];

        body.style.height = `${this.pageHeight}px`;
        [...document.getElementsByClassName('max-size-by-renderer')].forEach(dom => {
            dom.style.maxHeight = `${window.innerHeight}px`;
        });

        this.screenMeasures = screenMeasures;
    }

    get currSlide() {
        return Math.floor(((window.scrollY + this.slideHeight) / this.pageHeight) * this.slidesAmt);
    }

    goToSlide(slide) {
        const scrollToPosition = Math.ceil((slide - 1) * this.slideHeight) * 1.05;
        window.scrollTo({top: scrollToPosition, behavior: "smooth"});
    }

    register(scene) {
        setInterval(() => {
            scene.renderer.setSize( window.innerWidth, window.innerHeight );
            scene.cssRenderer.setSize( window.innerWidth, window.innerHeight );
        }, 200);

        this.prevSlide = this.currSlide;

        document.addEventListener('scroll', () => {
            if(this.currSlide !== this.prevSlide) {
                scene.play(this);
            }

            this.prevSlide = this.currSlide;
        });
    }
};
