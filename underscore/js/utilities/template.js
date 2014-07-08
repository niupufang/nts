/**
 * Created by Administrator on 2014/7/8 0008.
 */

var compiled = _.template('hello: <%=name%>');

console.log(compiled({name: 'hhstuhacker'}));

console.log(_.template('<% _.each(people,function (name) { %> <li><%= name%></li> \n<%})%>', {people: [
    'hhstuhacker',
    'lonelyclick',
    'someone'
]}));