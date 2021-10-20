while(true) {
    step =
    controller.move(); {
    if(!step) {
        controller.rotate();
        controller.move();
        }
    }
}
