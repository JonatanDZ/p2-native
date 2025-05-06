const result = function test(a,b){
    return a+b;
}

test('properly adds two numbers', ()=>{
    expect(result(1,2)).toBe(3)
})