declare var io:any;

var socket = io('https://pollster-server-ceyutkgvjm.now.sh');

class Handle {
  private elm: HTMLElement;
  private track: HTMLElement;
  private boundingElm: HTMLElement;
  private boundingHeight: number;
  private boundingTopOffset: number;
  private dragging: Boolean = false;
  private handlePercent: number = 0.5;
  private tid: number | undefined;

  constructor() {
    this.elm = document.querySelector('.handle') as HTMLElement;
    this.track = document.querySelector('.track') as HTMLElement;
    this.boundingElm = document.querySelector('.value-selector') as HTMLElement;


    this.updateBounds();
    this.setEventListeners();
    this.updateHandlePosition();
  }


  private setEventListeners() {
    document.body.addEventListener('mousedown', e => this.onMouseDown(e as MouseEvent));
    this.track.addEventListener('mousedown', e => this.onTrackDown(e as MouseEvent));
    document.body.addEventListener('mousemove', e => this.onMouseMove(e as MouseEvent));
    document.body.addEventListener('mouseleave', e => this.onMouseUp(e as MouseEvent));
    document.body.addEventListener('mouseup', e => this.onMouseUp(e as MouseEvent));

    document.body.addEventListener('touchstart', e => this.onTouchDown(e as TouchEvent));
    this.track.addEventListener('touchstart', e => this.onTrackTouchDown(e as TouchEvent));
    document.body.addEventListener('touchend', e => this.onMouseUp(e as TouchEvent));
    document.body.addEventListener('touchmove', e => this.onTouchMove(e as TouchEvent));

    window.addEventListener('resize', e => {
      this.updateBounds();
      this.updateHandlePosition();
    });
  }

  private highlightHandle(bool) {
    this.elm.classList.toggle('touchdown', bool);
  }

  private updateBounds() {
    let rect = this.boundingElm.getBoundingClientRect();
    this.boundingHeight = rect.height;
    this.boundingTopOffset = rect.top;
  }

  private updateHandlePosition() {
    let nextY = this.boundingHeight * this.handlePercent;
    this.elm.style.top = `${nextY}px`;
    this.throttle(() => {
      updateStatus(`sent: ${(1 - this.handlePercent).toFixed(3)}`)
      socket.emit('vote', {percent: this.handlePercent});
    });
  }

  private throttle(fn) {
    if (this.tid)
      return;

    this.tid = setTimeout(_ => {
      fn();
      this.tid = undefined;
    }, 200);
  }

  private onMouseMove(e: {pageY: number}) {
    if (this.dragging === false) {
      return;
    }

    this.handlePercent = Math.min(1, Math.max(0, (e.pageY - this.boundingTopOffset) / this.boundingHeight));
    this.updateHandlePosition();
  }

  private onTouchDown(e: TouchEvent) {
    this.onMouseDown(e);
  }

  private onTrackTouchDown(e: TouchEvent) {
   this.onTrackDown({pageY: e.touches[0].pageY});
  }

  private onTouchMove(e: TouchEvent) {
    e.preventDefault();
    this.onMouseMove({pageY: e.touches[0].pageY});
  }

  private onTrackDown(e: {pageY: number}) {
    this.onMouseDown(e);
    this.onMouseMove(e);
  }

  private onMouseDown(e: any) {
    this.highlightHandle(true);
    this.dragging = true;
  }

  private onMouseUp(e: any) {
    this.highlightHandle(false);
    this.dragging = false;
  }
}

new Handle();

socket.on('connect', _ => updateStatus('connected.'));
socket.on('reconnect', _ => updateStatus('connected.'));

socket.on('error', _ => updateStatus('error. :('));
socket.on('disconnect', _ => updateStatus('disconnected.'));

function updateStatus(msg: string) {
  document.querySelector('.status').textContent = msg;
}
