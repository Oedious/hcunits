var DataSource = function(setList) {
  this._setList = setList;
}

DataSource.prototype.getSetList = function() {
  return this._setList;
}