import { Entry } from './entry'

export class Report extends Entry {
  params

  async attendanceOfMonthly(params) {
    const users = params.users || []
    const targetDate = params.date
    const sql = `
      select
        t1.*
        , t2.created_at_max
        , t2.created_at_min
        , t2.temperature_max
        , t2.temperature_min
        , t2.temperature_avg
        , t2.cnt
        , t2.hours
        , t2.warning_temperature
        from
            ( 
                select
                    * 
                from
                    ( 
                        select
                            DATE_FORMAT( 
                                DATE_ADD( 
                                    DATE_ADD( 
                                        ?
                                        , INTERVAL - DAY (?) + 1 DAY
                                    ) 
                                    , INTERVAL xc DAY
                                ) 
                                , '%Y-%m-%d'
                            ) as date 
                        from
                            ( 
                                select
                                    @xi := @xi + 1 as xc 
                                from
                                    ( 
                                        select
                                            1 
                                        union 
                                        select
                                            2 
                                        union 
                                        select
                                            3 
                                        union 
                                        select
                                            4 
                                        union 
                                        select
                                            5 
                                        union 
                                        select
                                            6
                                    ) xc1
                                    , ( 
                                        select
                                            1 
                                        union 
                                        select
                                            2 
                                        union 
                                        select
                                            3 
                                        union 
                                        select
                                            4 
                                        union 
                                        select
                                            5 
                                        union 
                                        select
                                            6
                                    ) xc2
                                    , (select @xi := - 1) xc0
                            ) xcxc 
                        where
                            xc < DATEDIFF( 
                                DATE_ADD( 
                                    DATE_ADD( 
                                        ?
                                        , INTERVAL - DAY (?) + 1 DAY
                                    ) 
                                    , INTERVAL 1 MONTH
                                ) 
                                , DATE_ADD( 
                                    ?
                                    , INTERVAL - DAY (?) + 1 DAY
                                )
                            )
                    ) t0
                    , user_info
                    where user_info.uid in (?)
            ) t1 
            left join ( 
                select
                    t3.created_at_max
                    , t3.created_at_min
                    , t3.temperature_max
                    , t3.temperature_min
                    , t3.temperature_avg
                    , t3.cnt
                    , t3.hours
                    , t3.uid 
                    , t4.temperature as warning_temperature
                from
                    ( 
                        select
                            MAX(activestreamhc_log.created_at) as created_at_max
                            , MIN(activestreamhc_log.created_at) as created_at_min
                            , MAX(activestreamhc_log.temperature) as temperature_max
                            , MIN(activestreamhc_log.temperature) as temperature_min
                            , ROUND(AVG(activestreamhc_log.temperature), 2) as temperature_avg
                            , COUNT(activestreamhc_log.uid) as cnt
                            , TIMEDIFF( 
                                MAX(activestreamhc_log.created_at)
                                , MIN(activestreamhc_log.created_at)
                            ) as hours
                            , activestreamhc_log.uid as uid 
                            , MAX(activestreamhc_log.serialno) as serialno
                        from
                            activestreamhc_log 
                        where
                            activestreamhc_log.temperature > 0 
                        group by
                            DATE_FORMAT(activestreamhc_log.created_at, '%Y-%m-%d')
                            , activestreamhc_log.uid
                    ) t3 
                    left join devices as t4
                        on t4.serialno = t3.serialno
            ) t2 
                on t1.date = DATE_FORMAT(t2.created_at_max, '%Y-%m-%d') 
                and t1.uid = t2.uid 
        order by
            t1.uid
            , t1.date;
      `
    return await this.query(sql, [
      targetDate,
      targetDate,
      targetDate,
      targetDate,
      targetDate,
      targetDate,
      users,
    ])
  }

  get tableName() {
    return 'report'
  }
}
