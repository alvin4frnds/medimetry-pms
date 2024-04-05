export interface ILogging{
  start_trace_log(page_name,method_name,message,params);
  trace_line_exection(page_name,method_name,message,params);
  end_trace_log(page_name,method_name,message,params);

  start_info_log(page_name,method_name,message,params);
  info_line_exection(page_name,method_name,message,params);
  end_infor_log(page_name,method_name,message,params);

  start_debug_log(page_name,method_name,message,params);
  debug_line_exection(page_name,method_name,message,params);
  end_debug_log(page_name,method_name,message,params);

  start_warn_log(page_name,method_name,message,params);
  warn_line_exection(page_name,method_name,message,params);
  end_warn_log(page_name,method_name,message,params);

  start_error_log(page_name,method_name,message,params);
  error_line_exection(page_name,method_name,message,params);
  end_error_log(page_name,method_name,message,params);

  start_fatal_log(page_name,method_name,message,params);
  fatal_line_exection(page_name,method_name,message,params);
  end_fatal_log(page_name,method_name,message,params);


}
