describe('HotPath', function () {
  'use strict';

  var assume = require('assume')
    , HotPath = require('../hotpath');

  it('is exposed as function', function () {
    assume(HotPath).is.a('function');
  });

  it('can be constructed without the new keyword', function () {
    assume(HotPath()).is.instanceOf(HotPath);
  });

  describe('#get, #set', function () {
    it('only stores data if we do not blow out of memory', function () {
      var hp = new HotPath({ available: 100 });

      assume(hp.set('foo', new Buffer(40))).to.equal(false);
      assume(hp.get('foo')).equals(undefined);

      assume(hp.set('foo', new Buffer(2))).to.equal(true);
      assume(hp.get('foo')).is.a('buffer');

      hp.destroy();
    });

    it('returns undefined when key cannot be found', function () {
      var hp = new HotPath();

      assume(hp.get('foo')).equals(undefined);
    });

    it('transforms everything in buffers', function () {
      var hp = new HotPath();

      hp.set('foo', 'bar');
      assume(hp.get('foo')).is.a('buffer');

      hp.destroy();
    });

    it('increments the allocated size', function () {
      var hp = new HotPath()
        , x = new Buffer('foobar');

      assume(hp.allocated).equals(0);
      hp.set('foo', x);

      assume(hp.allocated).equals(x.length);

      hp.destroy();
    });

    it('increments allocated size including key size', function () {
      var hp = new HotPath({ key: true })
        , x = new Buffer('foobar');

      assume(hp.allocated).equals(0);

      hp.set('foo', x);
      assume(hp.allocated).equals(x.length + 3 + hp.prefix.length);

      hp.destroy();
    });

    it('increments the bytesize not length of key', function () {
      var hp = new HotPath({ key: true })
        , x = new Buffer('foobar');

      assume(hp.allocated).equals(0);

      hp.set('föö', x);
      assume(hp.allocated).equals(x.length + 5 + hp.prefix.length);

      hp.destroy();
    });

    it('returns true when stored', function () {
      var hp = new HotPath()
        , x = new Buffer('foobar');

      assume(hp.set('foo', x)).equals(true);

      hp.destroy();
    });
  });

  describe('#remove', function () {
    it('returns false when not stored', function () {
      var hp = new HotPath();

      assume(hp.remove('foo')).is.false();
    });

    it('decreases the allocated size', function () {
      var hp = new HotPath()
        , x = new Buffer('foobar');

      assume(hp.allocated).equals(0);
      hp.set('foo', x);
      hp.set('bar', x);
      assume(hp.allocated).equals(x.length * 2);

      assume(hp.remove('foo')).is.true();
      assume(hp.allocated).equals(x.length);

      assume(hp.remove('bar')).is.true();
      assume(hp.allocated).equals(0);
    });

    it('includes the keysize when decreasing allocated size', function () {
      var hp = new HotPath({ key: true })
        , x = new Buffer('foobar');

      assume(hp.allocated).equals(0);
      hp.set('foo', x);
      hp.set('föö', x);
      assume(hp.allocated).equals((x.length * 2) + 8 + (hp.prefix.length * 2));

      assume(hp.remove('foo')).is.true();
      assume(hp.allocated).equals(x.length + 5 + hp.prefix.length);

      assume(hp.remove('föö')).is.true();
      assume(hp.allocated).equals(0);
    });
  });

  describe('#reset', function () {
    it('clears all the things', function () {
      var hp = new HotPath();

      hp.set('foo', new Buffer('foo'));
      hp.set('bar', new Buffer('haai'));

      assume(hp.storage).is.length(2);
      assume(hp.allocated).to.be.above(0);

      hp.reset();
      assume(hp.allocated).equals(0);
      assume(hp.storage).is.length(0);
    });
  });

  describe('#ram', function () {
    it('normalizes the ram to a maximum');
    it('it allows more memory when we have more RAM available');
  });
});
