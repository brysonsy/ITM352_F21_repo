var amount = 175;
        var quarters = amount/25;
        var leftover = amount%25;
        var dimes = leftover/10;
        leftover = amount%10;
        var nickles = leftover/5;
        var pennies = amount%5;

        console.log(`${quarters} ${dimes} ${nickles} ${pennies}`)
