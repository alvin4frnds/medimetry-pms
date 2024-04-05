import {EntityRepository, getConnection, Repository} from "typeorm";
import {Habit} from "../models/Habit";

@EntityRepository(Habit)
export class PatientHabitRepository extends Repository<Habit> {


    // _repository;
    // constructor() {
    //     super();
    //     this._repository=getConnection().getRepository(Habit);
    // }

    getHabitsByPatientId(patientId: number) {
        return getConnection().getRepository(Habit).find({relations: ["terms"], where: {patient_id: patientId}});
    }
    saveHabits(habit: Habit) {
        return getConnection().getRepository(Habit).save(habit);
    }
    saveAllHabits(habits: any) {
        return getConnection().createQueryBuilder().insert().into(Habit).values(habits).execute();
    }
    deleteHabits(id){
        return getConnection().getRepository(Habit).delete({id:id});
    }

}