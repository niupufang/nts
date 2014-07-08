var db = window.openDatabase('testDB', '1.1', 'This is a TestDB', 1024 * 1024),
    createSql = 'create table if not exists t_user (id integer primary key, username text,address text)',
    somearray = [
        1,
        2,
        3,
        4,
        5,
        6,
        7
    ];

function prepareDatabase(db, createSql)
{
    db.transaction(function (t)
    {
        t.executeSql(createSql, [], function (t, rs)
        {
            console.log('create table : ', rs.rowsAffected);
        }, function (t, e)
        { // error callback ...
            console.log(e.message);
        });
    });
}

function deleteDatabase()
{

}

function dropTable(db, tableName)
{
    db.transaction(function (t)
    {
        t.executeSql('drop table ' + tableName, [], function (t, rs)
        {
            console.log('drop table : ', rs.rowsAffected);
        }, function (t, e)
        {
            console.log(e.message);
        });
    });
}

function readRecord()
{
    db.transaction(function (t)
    {
        t.executeSql('select * from t_user', [], function (t, rs)
        {
            console.log(rs);

            //console.log(rs.rows);

            for (var i = 0, len = rs.rows.length; i < len; i++)
            {
                var r = rs.rows.item(i);
                console.log(r.id + '_' + r.username + '_' + r.address);
            }

        }, function (t, e)
        {
            console.log(e.message);
        });
    });
}

function insertRecord()
{
    db.transaction(function (t)
    {
        t.executeSql('insert into t_user (id,username,address) values (1,"hhstuhacker","HeNan Shangcai")', [], function (t, rs)
        {
            console.log('insert record', rs.rowsAffected);
        }, function (t, e)
        {
            console.log(e.message);
        });

        t.executeSql('insert into t_user (id,username,address) values (?,?,?)', [
            2,
            'lonelyclick',
            'HeNan Zhumadian'
        ], function (t, rs)
        {
            console.log('insert record', rs.rowsAffected);
        }, function (t, e)
        {
            console.log(e.message);
        });

        t.executeSql('insert into t_user (id,username,address) values (?,?,?)', [
            3,
            'someone',
            'Zhuli'
        ], function (t, rs)
        {
            console.log('insert record', rs.rowsAffected);
        }, function (t, e)
        {
            console.log(e.message);
        });
    });
}

prepareDatabase(db, createSql);
//insertRecord();

//deleteDatabase(db);

//dropTable(db, 'testDB');

readRecord();




