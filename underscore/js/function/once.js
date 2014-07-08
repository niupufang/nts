/**
 * Created by Administrator on 2014/7/3 0003.
 */

var log = _.bind(console.log, console);

log = _.once(log);

log('semothing');
log('semothing');
log('semothing');
log('semothing');
log('semothing');
log('semothing');


var log2 = _(console.log).bind(console);

log2 = _(log2).once(log2);

log2('once');
log2('once');
log2('once');
log2('once');
log2('once');
log2('once');
log2('once');
log2('once');
log2('once');
log2('once');
log2('once');


var fn = _.after(5, function ()
{
    console.log('done');
});


fn();
fn();
fn();
fn();
