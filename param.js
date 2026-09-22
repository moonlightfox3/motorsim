const param = {
    "None": {}, // No movement

    "Demo_Run": {
        vars: { // Speeds, controller, state, etc.
            maxSpeed: rpm2radps(15), // rad/s

            forward: true, // bool
            stop: false, // bool
        },
        varsUnits: {
            maxSpeed: "rad/s",

            forward: "bool",
            stop: "bool",
        },
        varsSpecial: {
        },
        getSpeed: function (relPos, absPos, currentSpeed, deltaTime) { // rad/s
            if (this.vars.stop) return 0
            else return this.vars.maxSpeed * (this.vars.forward ? 1 : -1)
        },
        getTarget: function (relPos, absPos, currentSpeed, deltaTime) { // rad
            return null
        },
    },
    "Demo_Accel": {
        vars: { // Speeds, controller, state, etc.
            minSpeed: rpm2radps(0.001), // rad/s
            acceleration: rpm2radps(300), // rad/s^2
            maxSpeed: rpm2radps(350), // rad/s
            deceleration: rpm2radps(150), // rad/s^2

            forward: true, // bool
            accel: true, // bool
            decel: false, // bool
        },
        varsUnits: {
            minSpeed: "rad/s",
            acceleration: "rad/s^2",
            maxSpeed: "rad/s",
            deceleration: "rad/s^2",

            forward: "bool",
            accel: "bool",
            decel: "bool",
        },
        varsSpecial: {
        },
        getSpeed: function (relPos, absPos, currentSpeed, deltaTime) { // rad/s
            currentSpeed = Math.abs(currentSpeed)
            if (this.vars.decel) {
                this.vars.accel = false

                let speed = Math.max(currentSpeed - (this.vars.deceleration * deltaTime), 0)
                if (speed == 0) this.vars.decel = false

                if (speed >= this.vars.minSpeed) return speed * (this.vars.forward ? 1 : -1)
                else return 0
            } else if (this.vars.accel) {
                let speed = Math.min(currentSpeed + (this.vars.acceleration * deltaTime), this.vars.maxSpeed)
                if (speed == this.vars.maxSpeed) this.vars.accel = false

                if (speed >= this.vars.minSpeed) return speed * (this.vars.forward ? 1 : -1)
                else return 0
            } else if (currentSpeed >= this.vars.minSpeed) return Math.min(currentSpeed, this.vars.maxSpeed) * (this.vars.forward ? 1 : -1)
            else return 0
        },
        getTarget: function (relPos, absPos, currentSpeed, deltaTime) { // rad
            return null
        },
    },
    "Demo_Angle": {
        vars: { // Speeds, controller, state, etc.
            minSpeed: rpm2radps(0.001), // rad/s
            acceleration: rpm2radps(120), // rad/s^2
            maxSpeed: rpm2radps(60), // rad/s
            deceleration: rpm2radps(120), // rad/s^2
            
            kP: 5, // const
            kI: 0, // const
            kD: 0.3, // const

            absTarget: deg2rad(90), // rad
            totalError: 0, // num
            prevError: 0, // num
        },
        varsUnits: {
            minSpeed: "rad/s",
            acceleration: "rad/s^2",
            maxSpeed: "rad/s",
            deceleration: "rad/s^2",

            kP: "const",
            kI: "const",
            kD: "const",

            absTarget: "rad",
            totalError: "num",
            prevError: "num",
        },
        varsSpecial: {
            absTarget: {
                min: deg2rad(0), // rad
                max: deg2rad(360), // rad
                step: deg2rad(1), // rad
            },
        },
        getSpeed: function (relPos, absPos, currentSpeed, deltaTime) { // rad/s
            let error = this.vars.absTarget - absPos
            error -= Math.floor((error - Math.PI) / (Math.PI * 2)) * (Math.PI * 2)
            error -= Math.floor((error + Math.PI) / (Math.PI * 2)) * (Math.PI * 2)

            if (this.vars.kI != 0) this.vars.totalError = Math.max(-1 / this.vars.kI, Math.min(this.vars.totalError + (error * deltaTime), 1 / this.vars.kI))
            let errorDeriv = (error - this.vars.prevError) / deltaTime
            this.vars.prevError = error

            let calc = (this.vars.kP * error) + (this.vars.kI * this.vars.totalError) + (this.vars.kD * errorDeriv)
            if (Math.abs(calc) >= this.vars.minSpeed) {
                if (calc - currentSpeed >  (this.vars.acceleration * deltaTime)) calc = currentSpeed + (this.vars.acceleration * deltaTime)
                if (calc - currentSpeed < -(this.vars.acceleration * deltaTime)) calc = currentSpeed - (this.vars.acceleration * deltaTime)
                if (currentSpeed - calc >  (this.vars.deceleration * deltaTime)) calc = currentSpeed - (this.vars.deceleration * deltaTime)
                if (currentSpeed - calc < -(this.vars.deceleration * deltaTime)) calc = currentSpeed + (this.vars.deceleration * deltaTime)

                return Math.max(-this.vars.maxSpeed, Math.min(calc, this.vars.maxSpeed))
            } else return 0
        },
        getTarget: function (relPos, absPos, currentSpeed, deltaTime) { // rad
            return this.vars.absTarget
        },
    },
}
