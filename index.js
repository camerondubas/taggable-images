// TODO: Draggable
let defaultConfig = {
  radius: 10,
  isDisabled: false,
  isPercentage: true,
  allowOverflow: false,
  className: "tag-point",
  pointTextClassName: "point-text",
  activeClassName: "active",
  seedData: undefined
};

export default class ImageTag {
  constructor(className, config = {}) {
    this.wrapper = document.querySelector(className);
    this.image = this.wrapper.querySelector('img');

    // Stops the native browser image drag
    this.image.draggable = false;
    this.points = [];

    // Config Options
    this.config = Object.assign({}, defaultConfig, config);


    if (!config.allowOverflow) {
      this.wrapper.style.overflow = 'hidden';
    }

    if (config.seedData) {
      this.seedPoints(config.seedData);
    }

    this.image.addEventListener('click', event => this._handleClick(event))
  }

  // ===============
  // Public APIs
  // ===============

  newPoint() {
    let point = this._buildPoint();
    let position = {
      x: this._handleUnit(this.image.width/2, this.image.width),
      y: this._handleUnit(this.image.height/2, this.image.height)
    };

    this.positionPoint(point, position);
    this._displayPoint(point);
    this._savePoint(point);

    this.setActivePoint(point);
  }

  seedPoints(seeds) {
    this._destroyAllPoints();

    seeds.forEach(seed => {
      let point = this._buildPoint(seed);
      this.positionPoint(point);
      this._displayPoint(point);
      this._savePoint(point);
    });
  }

  getPointById(id) {
    return this.points.filter(point =>  point.id === id)[0];
  }

  getActivePoint() {
    return this.points.filter(point => point.isActive)[0];
  }

  setActivePoint(activePoint) {
    this.points.map(point => {
      this._applyClassNames(point);
      return point.isActive = point.id === activePoint.id ? true : false
    });

    this._applyActiveClassName(activePoint);
  }

  removePoint(pointToRemove) {
    pointToRemove.element.remove();
    this.points = this.points.filter(point => point.id !== pointToRemove.id);
  }

  positionPoint(point, position = {}) {
    point.x = position.x || point.x;
    point.y = position.y || point.y;
    point.element.style.top = `calc(${point.y + this._getUnitSymbol()} - ${this.config.radius}px)`;
    point.element.style.left = `calc(${point.x + this._getUnitSymbol()} - ${this.config.radius}px)`;
  }

  saveAllPoints() {
    this.points.forEach(point => {
      point.isActive = false;
      this._applyClassNames(point);
    })
  }

  disableNewPoints() {
    this.config.isDisabled = true;
  }

  enableNewPoints() {
    this.config.isDisabled = false;
  }

  // ===============
  // Private APIs
  // ===============

  _handleClick(event) {
    if (this.config.isDisabled) {
      return
    }

    let point = this.getActivePoint();

    if (point) {
      this.positionPoint(point, {
        x: this._handleUnit(event.offsetX, event.target.width),
        y: this._handleUnit(event.offsetY, event.target.height)
      });
    }
  }

  _buildPoint({x, y, id, text} = {}) {
    let point = {
      y: y || 0,
      x: x || 0,
      element: document.createElement('div'),
      id: id,
      text: text,
      isActive: false,
    }

    this._applyClassNames(point, id);
    this._applyPointText(point);

    return point;
  }

  _applyClassNames(point, id) {
    this._removeClassNames(point);

    const uniqueId = (id || point.id) || Date.now();
    const { element } = point;

    element.classList.add(this.config.className);
    element.classList.add(`${this.config.className}-${uniqueId}`);

  }

  _removeClassNames(point) {
    point.element.className = '';
  }

  _applyActiveClassName(point) {
    let { element } = point;
    element.classList.add(this.config.activeClassName);
  }

  _applyPointText(point) {
    point.element.innerHTML = `<div class="${this.config.pointTextClassName}">${point.text || ''}</div>`;
  }

  _savePoint(point) {
    this.points.push(point);
  }

  _displayPoint(point) {
    this.wrapper.appendChild(point.element);
  }

  _destroyAllPoints() {
    this.points.forEach(point => point.element.remove());
    this.points = [];
  }

  _handleUnit(pointLocation, maxLocation) {
    return this.config.isPercentage ? this._toPercentage(pointLocation, maxLocation) : pointLocation;
  }

  _getUnitSymbol() {
    return this.config.isPercentage ? '%' : 'px';
  }

  _toPercentage(pointLocation, maxLocation) {
    return (pointLocation / maxLocation) * 100;
  }
}
