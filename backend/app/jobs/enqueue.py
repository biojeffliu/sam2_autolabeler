from app.jobs.tasks import run_finetune_task

def enqueue_finetune_job(job_id: str, payload):
    run_finetune_task.delay(job_id, payload.model_dump())