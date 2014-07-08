/**
 * Created by Administrator on 2014/7/8 0008.
 */

console.log(_.escape('something > ? / * '));
console.log(_.escape('<div>something div</div>'));
console.log(_.escape('index.html?a=b&c=d&dsfa=sf'));

console.log(_.unescape('&lt;div&gt;something div&lt;/div&gt;'));