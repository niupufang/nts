/**
 * Created by Administrator on 2014/7/3 0003.
 */

var arr = [
    1,
    2,
    [
        [
            [
                [
                    [3]
                ]
            ]
        ]
    ],
    [
        [4],
        5,
        [
            [
                [
                    [
                        [
                            [10],
                            34
                        ],
                        56
                    ]
                ]
            ]
        ]
    ]
];

console.log(_.flatten(arr));
console.log(_.flatten(arr,true));