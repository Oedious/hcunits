class ListPanel extends NavPanel {
  constructor() {
    super();
    this.currentIndex_ = 0;
  }
  
  get currentIndex() {
    return this.currentIndex_
  }
  
  set currentIndex(currentIndex) {
    this.currentIndex_ = currentIndex
  }

  numItems() {
    throw new Error("Derived classes must implement ListPanel::numItems()")
  }

  activateCurrentItem() {
    throw new Error("Derived classes must implement ListPanel::activateCurrentItem()")
  }

  nextItem() {
    var numItems = this.numItems();
    if (numItems) {
      ++this.currentIndex_;
      if (this.currentIndex_ >= numItems) {
        this.currentIndex_ = 0;
      }
      this.activateCurrentItem();
    }
  }

  previousItem() {
    var numItems = this.numItems();
    if (numItems) {
      --this.currentIndex_;
      if (this.currentIndex_ < 0) {
        this.currentIndex_ = numItems - 1;
      }
      this.activateCurrentItem();
    }
  }
}